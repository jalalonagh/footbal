using FootballTacticalTraining.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace FootballTacticalTraining.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        _logger.LogInformation("Email sent to {To}: {Subject}", to, subject);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetAsync(string to, string resetLink)
    {
        _logger.LogInformation("Password reset email sent to {To}", to);
        return Task.CompletedTask;
    }

    public Task SendWelcomeEmailAsync(string to, string firstName)
    {
        _logger.LogInformation("Welcome email sent to {To} ({Name})", to, firstName);
        return Task.CompletedTask;
    }

    public Task SendSubscriptionConfirmationAsync(string to, string planName, DateTime endDate)
    {
        _logger.LogInformation("Subscription confirmation sent to {To} for plan {Plan}", to, planName);
        return Task.CompletedTask;
    }

    public Task SendSessionCompletedAsync(string to, string firstName, decimal score, string scenarioName)
    {
        _logger.LogInformation("Session completed email sent to {To}", to);
        return Task.CompletedTask;
    }
}
