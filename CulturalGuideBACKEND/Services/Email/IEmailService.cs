using System.Threading.Tasks;

namespace CulturalGuideBACKEND.Services.Email
{
    public interface IEmailService
    {
        Task SendVerificationEmail(string toEmail, string name, string token);
        Task SendPasswordRecoveryEmail(string toEmail, string name, string token);
        Task SendRegistrationEmail(string toEmail, string name, string verificationLink);
        Task SendEmailAsync(string toEmail, string subject, string htmlContent);
    }
}
