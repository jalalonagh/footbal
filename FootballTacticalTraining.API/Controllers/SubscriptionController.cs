using FootballTacticalTraining.Application.DTOs.Subscription;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities.Subscriptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using PaymentEntity = FootballTacticalTraining.Domain.Entities.Subscriptions.Payment;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubscriptionController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPaymentGateway _paymentGateway;
    private readonly ISubscriptionService _subscriptionService;

    public SubscriptionController(IUnitOfWork unitOfWork, IPaymentGateway paymentGateway, ISubscriptionService subscriptionService)
    {
        _unitOfWork = unitOfWork;
        _paymentGateway = paymentGateway;
        _subscriptionService = subscriptionService;
    }

    [HttpGet("plans")]
    public async Task<ActionResult<List<SubscriptionPlanDto>>> GetPlans()
    {
        var plans = await _unitOfWork.Repository<SubscriptionPlan>().FindAsync(p => p.IsActive);
        return Ok(plans.OrderBy(p => p.DisplayOrder).Select(p => new SubscriptionPlanDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            DurationDays = p.DurationDays,
            Price = p.Price,
            DiscountPrice = p.DiscountPrice,
            Currency = p.Currency,
            IsActive = p.IsActive
        }));
    }

    [Authorize]
    [HttpPost("create-payment")]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var plan = await _unitOfWork.Repository<SubscriptionPlan>().GetByIdAsync(dto.PlanId);
        if (plan == null) return NotFound("Plan not found");

        var amount = plan.DiscountPrice ?? plan.Price;

        if (amount == 0)
        {
            var freeSubscription = new Subscription
            {
                UserId = userId,
                PlanId = plan.Id,
                Status = Domain.Enums.SubscriptionStatus.Active,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(plan.DurationDays)
            };
            await _unitOfWork.Repository<Subscription>().AddAsync(freeSubscription);
            await _unitOfWork.SaveChangesAsync();
            await ProvisionEntitlementsAsync(userId, plan.Id, freeSubscription.Id);
            return Ok(new { paymentId = (Guid?)null, redirectUrl = "/payment/success" });
        }

        var result = await _paymentGateway.RequestPaymentAsync(amount, $"Subscription: {plan.Name}", "", dto.CallbackUrl);
        if (!result.Success) return BadRequest(result.ErrorMessage);

        var payment = new PaymentEntity
        {
            UserId = userId,
            PlanId = plan.Id,
            Amount = amount,
            Currency = plan.Currency,
            Status = Domain.Enums.PaymentStatus.Pending,
            Authority = result.Authority,
            Gateway = Domain.Enums.PaymentGatewayType.ZarinPal
        };

        await _unitOfWork.Repository<PaymentEntity>().AddAsync(payment);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { payment.Id, RedirectUrl = result.RedirectUrl });
    }

    [HttpGet("callback")]
    public async Task<IActionResult> PaymentCallback(
        [FromQuery] string Authority,
        [FromQuery] long Status,
        [FromQuery] string id)
    {
        if (Status != 100 && Status != 101) return BadRequest("Payment failed");

        var payments = await _unitOfWork.Repository<PaymentEntity>().FindAsync(p => p.Authority == Authority);
        var payment = payments.FirstOrDefault();
        if (payment == null) return NotFound("Payment not found");

        if (payment.Status == Domain.Enums.PaymentStatus.Completed)
            return Redirect("/payment/success");

        var verifyResult = await _paymentGateway.VerifyPaymentAsync(Authority, payment.Amount);
        if (!verifyResult.Success)
        {
            payment.Status = Domain.Enums.PaymentStatus.Failed;
            await _unitOfWork.Repository<PaymentEntity>().UpdateAsync(payment);
            await _unitOfWork.SaveChangesAsync();
            return BadRequest("Verification failed");
        }

        payment.Status = Domain.Enums.PaymentStatus.Completed;
        payment.ReferenceId = verifyResult.ReferenceId;
        payment.VerifiedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<PaymentEntity>().UpdateAsync(payment);

        var plan = await _unitOfWork.Repository<SubscriptionPlan>().GetByIdAsync(payment.PlanId!.Value);
        var subscription = new Subscription
        {
            UserId = payment.UserId,
            PlanId = payment.PlanId!.Value,
            PaymentId = payment.Id,
            Status = Domain.Enums.SubscriptionStatus.Active,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(plan!.DurationDays)
        };

        await _unitOfWork.Repository<Subscription>().AddAsync(subscription);
        await _unitOfWork.SaveChangesAsync();

        await ProvisionEntitlementsAsync(payment.UserId, payment.PlanId!.Value, subscription.Id);

        return Redirect("/payment/success");
    }

    [Authorize]
    [HttpGet("active")]
    public async Task<IActionResult> GetActiveSubscription()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var subscription = await _subscriptionService.GetActiveSubscriptionAsync(userId);
        if (subscription == null) return NotFound();
        return Ok(subscription);
    }

    [Authorize]
    [HttpGet("check-feature/{featureKey}")]
    public async Task<IActionResult> CheckFeature(string featureKey)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var hasAccess = await _subscriptionService.HasFeatureAccessAsync(userId, featureKey);
        var remaining = await _subscriptionService.GetRemainingUsageAsync(userId, featureKey);
        return Ok(new { HasAccess = hasAccess, RemainingUsage = remaining });
    }

    private async Task ProvisionEntitlementsAsync(Guid userId, Guid planId, Guid subscriptionId)
    {
        var planFeatures = await _unitOfWork.Repository<PlanFeature>().FindAsync(pf => pf.PlanId == planId);
        var subscription = await _unitOfWork.Repository<Subscription>().GetByIdAsync(subscriptionId);

        foreach (var pf in planFeatures.Where(pf => pf.IsEnabled))
        {
            var entitlement = new UserEntitlement
            {
                UserId = userId,
                FeatureId = pf.FeatureId,
                SubscriptionId = subscriptionId,
                Type = pf.Limit.HasValue ? Domain.Enums.EntitlementType.Usage : Domain.Enums.EntitlementType.Unlimited,
                RemainingUsage = pf.Limit,
                TotalUsage = pf.Limit,
                ExpiresAt = subscription?.EndDate
            };
            await _unitOfWork.Repository<UserEntitlement>().AddAsync(entitlement);
        }
        await _unitOfWork.SaveChangesAsync();
    }
}
