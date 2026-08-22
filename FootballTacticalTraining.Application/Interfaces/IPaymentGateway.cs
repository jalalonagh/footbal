namespace FootballTacticalTraining.Application.Interfaces;

public interface IPaymentGateway
{
    Task<PaymentRequestResult> RequestPaymentAsync(decimal amount, string description, string email, string callbackUrl);
    Task<PaymentVerificationResult> VerifyPaymentAsync(string authority, decimal amount);
    string GatewayName { get; }
}

public class PaymentRequestResult
{
    public bool Success { get; set; }
    public string? Authority { get; set; }
    public string? RedirectUrl { get; set; }
    public string? ErrorMessage { get; set; }
}

public class PaymentVerificationResult
{
    public bool Success { get; set; }
    public long? ReferenceId { get; set; }
    public string? ErrorMessage { get; set; }
}
