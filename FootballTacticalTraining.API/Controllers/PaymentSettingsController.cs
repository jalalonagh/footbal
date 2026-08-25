using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Infrastructure.Payment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/admin/payment-settings")]
[Authorize(Roles = "SuperAdmin")]
public class PaymentSettingsController : ControllerBase
{
    private readonly PaymentSettingsService _paymentSettings;

    public PaymentSettingsController(PaymentSettingsService paymentSettings)
    {
        _paymentSettings = paymentSettings;
    }

    [HttpGet]
    public IActionResult GetSettings()
    {
        return Ok(new { isSandbox = _paymentSettings.IsSandbox });
    }

    [HttpPut]
    public IActionResult UpdateSettings([FromBody] UpdatePaymentSettingsDto dto)
    {
        _paymentSettings.IsSandbox = dto.IsSandbox;
        return Ok(new { isSandbox = _paymentSettings.IsSandbox, message = dto.IsSandbox ? "Sandbox mode enabled" : "Production mode enabled" });
    }
}

public class UpdatePaymentSettingsDto
{
    public bool IsSandbox { get; set; }
}
