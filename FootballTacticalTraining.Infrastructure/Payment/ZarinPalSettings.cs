namespace FootballTacticalTraining.Infrastructure.Payment;

public class ZarinPalSettings
{
    public string MerchantId { get; set; } = string.Empty;
    public string ApiUrl { get; set; } = "https://api.zarinpal.com/pg/v4/payment/request.json";
    public string VerifyUrl { get; set; } = "https://api.zarinpal.com/pg/v4/payment/verify.json";
    public string GatewayUrl { get; set; } = "https://www.zarinpal.com/pg/StartPay/";
    public bool IsSandbox { get; set; }
    public string SandboxApiUrl { get; set; } = "https://sandbox.zarinpal.com/pg/v4/payment/request.json";
    public string SandboxVerifyUrl { get; set; } = "https://sandbox.zarinpal.com/pg/v4/payment/verify.json";
    public string SandboxGatewayUrl { get; set; } = "https://sandbox.zarinpal.com/pg/StartPay/";
}
