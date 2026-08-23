using FootballTacticalTraining.Application.DTOs.Subscription;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Entities.CMS;
using FootballTacticalTraining.Domain.Entities.Subscriptions;
using FootballTacticalTraining.Infrastructure.Audit;
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
    private readonly IAuditService _auditService;
    private readonly IEmailService _emailService;

    public SubscriptionController(IUnitOfWork unitOfWork, IPaymentGateway paymentGateway, ISubscriptionService subscriptionService, IAuditService auditService, IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _paymentGateway = paymentGateway;
        _subscriptionService = subscriptionService;
        _auditService = auditService;
        _emailService = emailService;
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

        // Apply coupon if provided
        if (!string.IsNullOrEmpty(dto.CouponCode))
        {
            var coupons = await _unitOfWork.Repository<Coupon>()
                .FindAsync(c => c.Code == dto.CouponCode && c.IsActive && c.EndDate > DateTime.UtcNow && c.CurrentUses < (c.MaxUses ?? int.MaxValue));
            var coupon = coupons.FirstOrDefault();
            if (coupon == null) return BadRequest("Invalid or expired coupon code");

            var discounts = await _unitOfWork.Repository<Discount>().FindAsync(d => d.Id == coupon.DiscountId);
            var discount = discounts.FirstOrDefault();

            if (discount != null)
            {
                if (discount.Percentage.HasValue)
                    amount = amount - (amount * discount.Percentage.Value / 100);
                else if (discount.FixedAmount.HasValue)
                    amount = Math.Max(0, amount - discount.FixedAmount.Value);
            }

            coupon.CurrentUses++;
            await _unitOfWork.Repository<Coupon>().UpdateAsync(coupon);
        }

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
            await _auditService.LogAsync("Create", "Subscription", freeSubscription.Id.ToString(), newValue: plan.Name, context: HttpContext);
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
        await _auditService.LogAsync("CreatePayment", "Payment", payment.Id.ToString(), newValue: amount.ToString(), context: HttpContext);

        return Ok(new { payment.Id, RedirectUrl = result.RedirectUrl });
    }

    [HttpGet("callback")]
    [AllowAnonymous]
    public async Task<IActionResult> PaymentCallback(
        [FromQuery] string Authority,
        [FromQuery] string Status,
        [FromQuery] string? id)
    {
        if (string.IsNullOrEmpty(Authority))
            return BadRequest("Missing authority parameter");

        // ZarinPal sends Status as "OK" for success, or numeric codes
        bool isOk = Status?.ToUpper() == "OK" || Status == "100" || Status == "101";
        if (!isOk) return Redirect("/payment/failure");

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
            await _auditService.LogAsync("PaymentFailed", "Payment", payment.Id.ToString(), context: HttpContext);
            return Redirect("/payment/failure");
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
        await _auditService.LogAsync("PaymentCompleted", "Payment", payment.Id.ToString(), newValue: plan.Name, context: HttpContext);

        return Redirect("/payment/success");
    }

    [Authorize]
    [HttpGet("active")]
    public async Task<IActionResult> GetActiveSubscription()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var subscription = await _subscriptionService.GetActiveSubscriptionAsync(userId);
        if (subscription == null) return NotFound();

        var plan = await _unitOfWork.Repository<SubscriptionPlan>().GetByIdAsync(subscription.PlanId);

        return Ok(new
        {
            id = subscription.Id,
            planId = subscription.PlanId,
            planName = plan?.Name ?? "Free",
            status = subscription.Status.ToString(),
            startDate = subscription.StartDate,
            endDate = subscription.EndDate
        });
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
