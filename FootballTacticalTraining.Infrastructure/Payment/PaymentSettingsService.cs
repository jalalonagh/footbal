using Microsoft.Extensions.Configuration;

namespace FootballTacticalTraining.Infrastructure.Payment;

public class PaymentSettingsService
{
    private readonly IConfiguration _configuration;
    private bool _isSandbox;

    public PaymentSettingsService(IConfiguration configuration)
    {
        _configuration = configuration;
        _isSandbox = configuration.GetValue<bool>("ZarinPal:IsSandbox");
    }

    public bool IsSandbox
    {
        get => _isSandbox;
        set => _isSandbox = value;
    }
}
