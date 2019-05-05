using System;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace MaxOrg
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args)
        {
            var config = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddEnvironmentVariables()
                .AddJsonFile("certificate.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"certificate.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json",
                    optional: true, reloadOnChange: true)
                .Build();

#if DEBUG
            var certificateSettings = config.GetSection("certificateSettings");
            string certificateFileName = certificateSettings.GetValue<string>("filename");
            string certificatePassword = certificateSettings.GetValue<string>("password");
            var certificate = new X509Certificate2(certificateFileName, certificatePassword);
#endif
            return WebHost.CreateDefaultBuilder(args)
                .UseKestrel(
                    options =>
                    {
                        options.AddServerHeader = false;
#if DEBUG
                        options.ConfigureHttpsDefaults(https => { https.ServerCertificate = certificate; });
#endif
                    })
                .UseStartup<Startup>();
        }
    }
}