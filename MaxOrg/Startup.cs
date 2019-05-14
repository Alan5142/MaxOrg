using System;
using System.IO.Compression;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using ArangoDB.Client;
using MaxOrg.Hubs;
using MaxOrg.Services.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.AspNetCore.WebSockets;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Newtonsoft.Json;
using shortid;

namespace MaxOrg
{
    /// <summary>
    /// Configura varios servicios necesarios
    /// </summary>
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        private IConfiguration Configuration { get; }

        private void ConfigureAzure(IServiceCollection services)
        {
            services.AddTransient(provider =>
            {
                var storage = CloudStorageAccount.Parse(Configuration["AppSettings:AzureFiles:ConnectionString"]);

                var blobClient = storage.CreateCloudBlobClient();

                var container = blobClient.GetContainerReference("maxorgfiles");

                container.SetPermissionsAsync(new BlobContainerPermissions
                {
                    PublicAccess = BlobContainerPublicAccessType.Off
                }).Wait();
                return container;
            });
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors();

            services.AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Latest)
                .AddJsonOptions(options =>
                {
                    options.SerializerSettings.DateTimeZoneHandling = DateTimeZoneHandling.Utc;
                });

            services.AddAntiforgery(
                options =>
                {
                    options.Cookie.Name = "_af";
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                    options.HeaderName = "X-XSRF-TOKEN";
                }
            );

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
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];

                            // If the request is for our hub...
                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) &&
                                (path.StartsWithSegments("/notification-hub") || 
                                 path.StartsWithSegments("/chat-hub") ||
                                 path.StartsWithSegments("/kanban-hub")))
                            {
                                // Read the token out of the query string
                                context.Token = accessToken;
                            }

                            return Task.CompletedTask;
                        },
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
            services.AddSpaStaticFiles(configuration => { configuration.RootPath = "ClientApp/dist/ClientApp"; });

            // Configure ArangoDB settings, to instantiate an object to communicate with Arango
            ArangoDatabase.ChangeSetting(settings =>
            {
                settings.Database = Configuration["AppSettings:Database:Name"];
                settings.Url = Configuration["AppSettings:Database:Host"];

                var dbUsername = Configuration["AppSettings:Database:User"];
                var dbPassword = Configuration["AppSettings:Database:Password"];

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
            
            services.AddTransient(provider => ArangoDatabase.CreateWithSetting());
            services.AddSingleton(new HttpClient());

            services.AddSingleton<IScheduledTask, RemoveExpiredTokens>();
            services.AddSingleton<IScheduledTask, RemoveEmptyUsers>();
            services.AddScheduler((sender, args) => { args.SetObserved(); });
            services.AddSignalR();

            ConfigureAzure(services);

            services.Configure<GzipCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Optimal;
            });

            services.Configure<BrotliCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Optimal;
            });

            services.AddResponseCompression(options =>
            {
                options.Providers.Add<BrotliCompressionProvider>();
                options.Providers.Add<GzipCompressionProvider>();
                options.EnableForHttps = true;
            });
            services.AddWebSockets(configure =>
            {
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseResponseCompression();

            //app.UseCors(builder =>
            //            builder
            //            .WithOrigins("https://localhost:44384", "http://localhost:4200").AllowAnyOrigin());
            app.UseCors(builder =>
            {
                builder.AllowAnyOrigin();
                builder.AllowAnyMethod();
                builder.AllowAnyMethod();
            });

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

            app.UseWebSockets();
            app.UseSignalR(routes =>
            {
                routes.MapHub<NotificationHub>("/notification-hub");
                routes.MapHub<KanbanHub>("/kanban-hub");
                routes.MapHub<ChatHub>("/chat-hub");
            });

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

            // Configure id generator
            ShortId.SetCharacters("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");
            ShortId.SetSeed(1939048828);
        }

        private void CreateCollection(IArangoDatabase db, string collectionName,
            CollectionType type = CollectionType.Document)
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