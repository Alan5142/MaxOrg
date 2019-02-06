using ArangoDB.Client;
using MaxOrg.Hubs;
using MaxOrg.Services.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace MaxOrg
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSignalR();
            services.AddCors();

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Latest);

            services.AddAuthorization(auth =>
            {
                auth.AddPolicy("Bearer", new AuthorizationPolicyBuilder()
                  .AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme)
                  .RequireAuthenticatedUser()
                  .Build());
                auth.DefaultPolicy = auth.GetPolicy(JwtBearerDefaults.AuthenticationScheme);
            });


            var key = Encoding.ASCII.GetBytes(Configuration["AppSettings:Secret"]);

            services.AddAuthentication(options =>
            {
                options.DefaultSignInScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = "GitHub";
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = Configuration["AppSettings:DefaultURL"],
                    ClockSkew = TimeSpan.Zero
                };
                options.Audience = Configuration["AppSettings:Jwt:Audience"];
                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                        {
                            context.Response.Headers.Add("Token-Expired", "true");
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });

            // Configure ArangoDB settings, to instantiate an object to communicate with Arango
            ArangoDatabase.ChangeSetting(settings =>
            {
                settings.Database = Configuration["AppSettings:Database:Name"];
                settings.Url = Configuration["AppSettings:Database:Host"];

                string dbUsername = Configuration["AppSettings:Database:User"];
                string dbPassword = Configuration["AppSettings:Database:Password"];

                settings.Credential = new NetworkCredential(dbUsername, dbPassword);
                settings.SystemDatabaseCredential = new NetworkCredential(dbUsername, dbPassword);
                settings.WaitForSync = true;
                settings.ClusterMode = true;
                settings.Serialization.SerializeEnumAsInteger = false;
            });

            // init all :) 
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                CreateCollection(db, "Group");
                CreateCollection(db, "RefreshToken");
                CreateCollection(db, "User");
                CreateCollection(db, "Subgroup", CollectionType.Edge);
                CreateCollection(db, "UsersInGroup", CollectionType.Edge);
            }
            services.AddSingleton(ArangoDatabase.CreateWithSetting());

            services.AddSingleton<IScheduledTask, RemoveExpiredTokens>();
            services.AddScheduler((sender, args) =>
            {
                args.SetObserved();
            });
            services.AddSignalR();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            //app.UseCors(builder =>
            //            builder
            //            .WithOrigins("https://localhost:44384", "http://localhost:4200").AllowAnyOrigin());
            app.UseCors(builder =>
                        builder
                        .AllowAnyOrigin());

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            app.UseAuthentication();

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });

            app.UseSignalR(routes =>
            {
                routes.MapHub<NotificationHub>("/notificationHub");
            });
        }

        void CreateCollection(IArangoDatabase db, string collectionName, CollectionType type = CollectionType.Document)
        {
            try
            {
                db.CreateCollection(collectionName, type: type);
            }
            catch (Exception)
            {
                // ignore, it already exists
            }
        }
    }
}
