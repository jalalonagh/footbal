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
    private readonly ILogger<ZarinPalPaymentGateway> _logger;

    public string GatewayName => "ZarinPal";

    public ZarinPalPaymentGateway(HttpClient httpClient, IOptions<ZarinPalSettings> settings, ILogger<ZarinPalPaymentGateway> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    private string ApiUrl => _settings.IsSandbox ? _settings.SandboxApiUrl : _settings.ApiUrl;
    private string VerifyUrl => _settings.IsSandbox ? _settings.SandboxVerifyUrl : _settings.VerifyUrl;
    private string GatewayBaseUrl => _settings.IsSandbox ? _settings.SandboxGatewayUrl : _settings.GatewayUrl;

    public async Task<PaymentRequestResult> RequestPaymentAsync(decimal amount, string description, string email, string callbackUrl)
    {
        try
        {
            // ZarinPal expects amount in Rials (1 Toman = 10 Rials)
            var amountInRials = (int)(amount * 10);

            var request = new
            {
                merchant_id = _settings.MerchantId,
                amount = amountInRials,
                callback_url = callbackUrl,
                description = description,
                email = email
            };

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

            _logger.LogWarning("ZarinPal payment request failed: Code={Code}, Message={Message}", result?.Data?.Code, result?.Data?.Message);
            return new PaymentRequestResult { Success = false, ErrorMessage = result?.Data?.Message ?? "Payment request failed" };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ZarinPal payment request error");
            return new PaymentRequestResult { Success = false, ErrorMessage = "Payment service unavailable" };
        }
    }

    public async Task<PaymentVerificationResult> VerifyPaymentAsync(string authority, decimal amount)
    {
        try
        {
            // ZarinPal expects amount in Rials (1 Toman = 10 Rials)
            var amountInRials = (int)(amount * 10);

            var request = new
            {
                merchant_id = _settings.MerchantId,
                authority = authority,
                amount = amountInRials
            };

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
            return new PaymentVerificationResult { Success = false, ErrorMessage = result?.Data?.Message ?? "Verification failed" };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ZarinPal verification error");
            return new PaymentVerificationResult { Success = false, ErrorMessage = "Verification service unavailable" };
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
