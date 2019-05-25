using System.Threading.Tasks;

namespace MaxOrg.Services.Email
{
    public interface IEmailSender
    {
        Task<bool> SendEmailAsync(string email, string subject, string message);
    }
}