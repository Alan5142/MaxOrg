using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Net;
using System.Security.Cryptography.X509Certificates;

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
            .AddJsonFile($"certificate.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json", optional: true, reloadOnChange: true)
            .Build();

            var certificateSettings = config.GetSection("certificateSettings");
            string certificateFileName = certificateSettings.GetValue<string>("filename");
            string certificatePassword = certificateSettings.GetValue<string>("password");
            var certificate = new X509Certificate2(certificateFileName, certificatePassword);

            return WebHost.CreateDefaultBuilder(args)
                .UseKestrel(
                options =>
                {
                    options.AddServerHeader = false;
                    options.ConfigureHttpsDefaults(https =>
                    {
                        https.ServerCertificate = certificate;
                    });
                })
                .UseStartup<Startup>();
        }

    }
}
