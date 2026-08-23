using System.Net;
using System.Net.Mail;
using FootballTacticalTraining.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FootballTacticalTraining.Infrastructure.Services;

public class EmailSettings
{
    public string SmtpHost { get; set; } = "localhost";
    public int SmtpPort { get; set; } = 587;
    public string SmtpUser { get; set; } = string.Empty;
    public string SmtpPass { get; set; } = string.Empty;
    public string FromAddress { get; set; } = "noreply@football-training.com";
    public string FromName { get; set; } = "Football Tactical Training";
    public bool EnableSsl { get; set; } = true;
    public bool UseStub { get; set; } = true;
}

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly EmailSettings _settings;

    public EmailService(ILogger<EmailService> logger, IOptions<EmailSettings> settings)
    {
        _logger = logger;
        _settings = settings.Value;
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        if (_settings.UseStub)
        {
            _logger.LogInformation("[STUB EMAIL] To={To}, Subject={Subject}", to, subject);
            return;
        }

        try
        {
            using var message = new MailMessage();
            message.From = new MailAddress(_settings.FromAddress, _settings.FromName);
            message.To.Add(to);
            message.Subject = subject;
            message.Body = htmlBody;
            message.IsBodyHtml = true;

            using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
            {
                Credentials = new NetworkCredential(_settings.SmtpUser, _settings.SmtpPass),
                EnableSsl = _settings.EnableSsl
            };

            await client.SendMailAsync(message);
            _logger.LogInformation("Email sent to {To}: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", to);
        }
    }

    public Task SendPasswordResetAsync(string to, string resetLink)
    {
        return SendEmailAsync(to, "Password Reset Request",
            $"<h2>Password Reset</h2><p>Click the link below to reset your password:</p><p><a href=\"{resetLink}\">Reset Password</a></p><p>This link expires in 1 hour.</p>");
    }

    public Task SendWelcomeEmailAsync(string to, string firstName)
    {
        return SendEmailAsync(to, "Welcome to Football Tactical Training!",
            $"<h2>Welcome, {firstName}!</h2><p>Thank you for joining Football Tactical Training.</p><p>Start exploring scenarios and improve your tactical understanding!</p>");
    }

    public Task SendSubscriptionConfirmationAsync(string to, string planName, DateTime endDate)
    {
        return SendEmailAsync(to, "Subscription Confirmed",
            $"<h2>Subscription Active</h2><p>Your <strong>{planName}</strong> plan is active until {endDate:MMMM dd, yyyy}.</p>");
    }

    public Task SendSessionCompletedAsync(string to, string firstName, decimal score, string scenarioName)
    {
        return SendEmailAsync(to, "Training Session Completed",
            $"<h2>Great work, {firstName}!</h2><p>You completed <strong>{scenarioName}</strong> with a score of <strong>{score:F1}%</strong>.</p>");
    }
}
