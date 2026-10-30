using SendGrid;
using SendGrid.Helpers.Mail;

namespace CulturalGuideBACKEND.Services.Email
{
    public class SendGridEmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public SendGridEmailService(IConfiguration config)
        {
            _config = config;
        }
        
        public async Task SendVerificationEmail(string toEmail, string toName, string verificationLink)
        {
            var client = new SendGridClient(_config["SendGrid:ApiKey"]);
            var from = new EmailAddress(_config["SendGrid:SenderEmail"], _config["SendGrid:SenderName"]);
            var to = new EmailAddress(toEmail, toName);

            string subject = "Bitte E-Mail-Adresse verifizieren – Kulturführer";

            string html = await File.ReadAllTextAsync("EmailTemplates/RegistrationEmail.html");
            html = html.Replace("{{name}}", toName)
                .Replace("{{verificationLink}}", verificationLink);

            var msg = MailHelper.CreateSingleEmail(from, to, subject, "", html);
            await client.SendEmailAsync(msg);
        }


        public async Task SendPasswordRecoveryEmail(string toEmail, string toName, string resetLink)
        {
            var client = new SendGridClient(_config["SendGrid:ApiKey"]);
            var from = new EmailAddress(_config["SendGrid:SenderEmail"], _config["SendGrid:SenderName"]);
            var to = new EmailAddress(toEmail, toName);

            string subject = "Passwort zurücksetzen – Kulturführer";

            string html = await File.ReadAllTextAsync("EmailTemplates/PasswordRecoveryEmail.html");
            html = html
                .Replace("{{name}}", toName)
                .Replace("{{resetLink}}", resetLink);

            var msg = MailHelper.CreateSingleEmail(from, to, subject, "", html);
            await client.SendEmailAsync(msg);
        }
        
        public async Task SendRegistrationEmail(string toEmail, string toName, string verificationLink)
        {
            var client = new SendGridClient(_config["SendGrid:ApiKey"]);
            var from = new EmailAddress(_config["SendGrid:SenderEmail"], _config["SendGrid:SenderName"]);
            var to = new EmailAddress(toEmail, toName);

            string subject = "Willkommen bei Kulturführer! Bitte E-Mail verifizieren";

            string html = await File.ReadAllTextAsync("EmailTemplates/RegistrationEmail.html");
            html = html.Replace("{{name}}", toName)
                .Replace("{{verificationLink}}", verificationLink);

            var msg = MailHelper.CreateSingleEmail(from, to, subject, "", html);
            await client.SendEmailAsync(msg);
        }
        
        public async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
        {
            var client = new SendGridClient(_config["SendGrid:ApiKey"]);
            var from = new EmailAddress(_config["SendGrid:SenderEmail"], _config["SendGrid:SenderName"]);
            var to = new EmailAddress(toEmail);

            var msg = MailHelper.CreateSingleEmail(from, to, subject, "", htmlContent);
            await client.SendEmailAsync(msg);
        }
    }
}
