using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using MaxOrg.Models.Email;
using Microsoft.Extensions.Options;

namespace MaxOrg.Services.Email
{
    public class RegistrationSender : IEmailSender
    {
        public RegistrationSender(IOptions<EmailSettings> emailSettings)
        {
            EmailSettings = emailSettings.Value;
        }

        public EmailSettings EmailSettings { get; }

        public Task<bool> SendEmailAsync(string email, string subject, string message)
        {
            return Execute(email, subject, message);
        }

        public async Task<bool> Execute(string email, string subject, string message)
        {
            try
            {
                var toEmail = string.IsNullOrEmpty(email) 
                    ? EmailSettings.ToEmail 
                    : email;
                var mail = new MailMessage()
                {
                    From = new MailAddress(EmailSettings.UsernameEmail, "MaxOrg - Software Management Platform")
                };
                mail.To.Add(new MailAddress(toEmail));
                mail.CC.Add(new MailAddress(EmailSettings.CcEmail));

                mail.Subject = "MaxOrg - " + subject;
                mail.Body = message;
                mail.IsBodyHtml = true;
                mail.Priority = MailPriority.High;

                using (var smtp = new SmtpClient(EmailSettings.PrimaryDomain, EmailSettings.PrimaryPort))
                {
                    smtp.Credentials = new NetworkCredential(EmailSettings.UsernameEmail, EmailSettings.UsernamePassword);
                    smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                    smtp.EnableSsl = true;
                    await smtp.SendMailAsync(mail);
                    return true;
                }
            }
            catch(Exception)
            {
                return false;
            }
        }
    }
}