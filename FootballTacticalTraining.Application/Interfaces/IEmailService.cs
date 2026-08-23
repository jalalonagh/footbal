namespace FootballTacticalTraining.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string htmlBody);
    Task SendPasswordResetAsync(string to, string resetLink);
    Task SendWelcomeEmailAsync(string to, string firstName);
    Task SendSubscriptionConfirmationAsync(string to, string planName, DateTime endDate);
    Task SendSessionCompletedAsync(string to, string firstName, decimal score, string scenarioName);
}
