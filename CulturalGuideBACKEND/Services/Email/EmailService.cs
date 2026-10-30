
using System.Net.Mail;
using System.Net;
using System.Threading.Tasks;
using SendGrid;
using SendGrid.Helpers.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Collections.Generic;


namespace CulturalGuideBACKEND.Services.Email
{
public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;
    private readonly string _apiKey;
    

    public EmailService(IConfiguration config, IWebHostEnvironment env)
    {
        _config = config;
        _env = env;
    }

    private string LoadTemplate(string fileName, Dictionary<string, string> tokens)
    {
        var path = Path.Combine(_env.ContentRootPath, "EmailTemplates", fileName);
        var html = File.ReadAllText(path);

        foreach (var token in tokens)
            html = html.Replace($"{{{{{token.Key}}}}}", token.Value);

        return html;
    }

    private async Task SendEmail(string toEmail, string subject, string htmlBody)
    {
        using var client = new SmtpClient(_config["Email:SmtpHost"])
        {
            Port = int.Parse(_config["Email:SmtpPort"]!),
            Credentials = new NetworkCredential(
                _config["Email:Username"],
                _config["Email:Password"]
            ),
            EnableSsl = true
        };

        var msg = new MailMessage
        {
            From = new MailAddress(_config["Email:From"], "Your App"),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };

        msg.To.Add(toEmail);
        await client.SendMailAsync(msg);
    }
    
    

    public async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
    {
        var client = new SendGridClient(_apiKey);

        var from = new EmailAddress("no-reply@kultur.com", "Kulturführer");
        var to = new EmailAddress(toEmail);

        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent: null, htmlContent);
        await client.SendEmailAsync(msg);
    }


    public async Task SendVerificationEmail(string toEmail, string name, string token)
    {
        var link = $"{_config["App:FrontendUrl"]}/verify-email?token={token}";
        var html = LoadTemplate("verification.html", new()
        {
            { "name", name },
            { "verifyLink", link }
        });

        await SendEmail(toEmail, "Bitte E-Mail verifizieren", html);
    }

    public async Task SendPasswordRecoveryEmail(string toEmail, string name, string token)
    {
        var link = $"{_config["App:FrontendUrl"]}/reset-password?token={token}";
        var html = LoadTemplate("password_recovery.html", new()
        {
            { "name", name },
            { "resetLink", link }
        });

        await SendEmail(toEmail, "Passwort zurücksetzen", html);
    }


	public async Task SendRegistrationEmail(string toEmail, string toName, string verificationLink)
    {
        var html = LoadTemplate("registration.html", new()
        {
            { "name", toName },
            { "verificationLink", verificationLink }
        });

        await SendEmail(toEmail, "Willkommen bei Kulturführer! Bitte E-Mail verifizieren", html);
    }
}

}
