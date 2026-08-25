using System.Net.Http.Json;
using System.Text.Json;
using FootballTacticalTraining.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FootballTacticalTraining.Infrastructure.Payment;

public class ZarinPalPaymentGateway : IPaymentGateway
{
    private readonly HttpClient _httpClient;
    private readonly ZarinPalSettings _settings;
    private readonly PaymentSettingsService _paymentSettings;
    private readonly ILogger<ZarinPalPaymentGateway> _logger;

    public string GatewayName => "ZarinPal";

    public ZarinPalPaymentGateway(HttpClient httpClient, IOptions<ZarinPalSettings> settings, PaymentSettingsService paymentSettings, ILogger<ZarinPalPaymentGateway> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _paymentSettings = paymentSettings;
        _logger = logger;
    }

    private bool IsSandbox => _paymentSettings.IsSandbox;
    private string ApiUrl => IsSandbox ? _settings.SandboxApiUrl : _settings.ApiUrl;
    private string VerifyUrl => IsSandbox ? _settings.SandboxVerifyUrl : _settings.VerifyUrl;
    private string GatewayBaseUrl => IsSandbox ? _settings.SandboxGatewayUrl : _settings.GatewayUrl;

    public async Task<PaymentRequestResult> RequestPaymentAsync(decimal amount, string description, string email, string callbackUrl)
    {
        try
        {
            var amountInRials = (int)(amount * 10);

            var request = new
            {
                merchant_id = _settings.MerchantId,
                amount = amountInRials,
                callback_url = callbackUrl,
                description = description,
                email = email
            };

            _logger.LogInformation("ZarinPal payment request: Sandbox={Sandbox}, Url={Url}", IsSandbox, ApiUrl);

            var response = await _httpClient.PostAsJsonAsync(ApiUrl, request);
            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<ZarinPalRequestResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (result?.Data?.Code == 100 && !string.IsNullOrEmpty(result.Data.Authority))
            {
                return new PaymentRequestResult
                {
                    Success = true,
                    Authority = result.Data.Authority,
                    RedirectUrl = $"{GatewayBaseUrl}{result.Data.Authority}"
                };
            }

            _logger.LogWarning("ZarinPal payment request failed: Code={Code}, Message={Message}, Sandbox={Sandbox}", result?.Data?.Code, result?.Data?.Message, IsSandbox);
            return new PaymentRequestResult { Success = false, ErrorMessage = $"ZarinPal Error ({result?.Data?.Code}): {result?.Data?.Message ?? "Payment request failed"}" };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ZarinPal payment request error: Sandbox={Sandbox}, Url={Url}", IsSandbox, ApiUrl);
            return new PaymentRequestResult { Success = false, ErrorMessage = $"Payment service error: {ex.Message}" };
        }
    }

    public async Task<PaymentVerificationResult> VerifyPaymentAsync(string authority, decimal amount)
    {
        try
        {
            var amountInRials = (int)(amount * 10);

            var request = new
            {
                merchant_id = _settings.MerchantId,
                authority = authority,
                amount = amountInRials
            };

            _logger.LogInformation("ZarinPal payment verify: Sandbox={Sandbox}, Url={Url}", IsSandbox, VerifyUrl);

            var response = await _httpClient.PostAsJsonAsync(VerifyUrl, request);
            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<ZarinPalVerifyResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (result?.Data?.Code == 100 || result?.Data?.Code == 101)
            {
                return new PaymentVerificationResult
                {
                    Success = true,
                    ReferenceId = result.Data.RefId
                };
            }

            _logger.LogWarning("ZarinPal verification failed: Code={Code}, Message={Message}", result?.Data?.Code, result?.Data?.Message);
            return new PaymentVerificationResult { Success = false, ErrorMessage = $"ZarinPal Verify Error ({result?.Data?.Code}): {result?.Data?.Message ?? "Verification failed"}" };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ZarinPal verification error: Sandbox={Sandbox}", IsSandbox);
            return new PaymentVerificationResult { Success = false, ErrorMessage = $"Verification service error: {ex.Message}" };
        }
    }
}

internal class ZarinPalRequestResponse
{
    public ZarinPalData? Data { get; set; }
    public List<string>? Errors { get; set; }
}

internal class ZarinPalVerifyResponse
{
    public ZarinPalData? Data { get; set; }
    public List<string>? Errors { get; set; }
}

internal class ZarinPalData
{
    public int Code { get; set; }
    public string? Message { get; set; }
    public string? Authority { get; set; }
    public long? RefId { get; set; }
}
