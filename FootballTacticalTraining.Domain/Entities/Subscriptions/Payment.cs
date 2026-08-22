using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Domain.Entities.Subscriptions;

public class Payment : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid? SubscriptionId { get; set; }
    public Subscription? Subscription { get; set; }
    public Guid? PlanId { get; set; }
    public SubscriptionPlan? Plan { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "IRR";
    public PaymentStatus Status { get; set; }
    public PaymentGatewayType Gateway { get; set; } = PaymentGatewayType.ZarinPal;
    public string? Authority { get; set; }
    public long? ReferenceId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? VerifiedAt { get; set; }
    public string? GatewayResponseJson { get; set; }
    public ICollection<PaymentTransaction> Transactions { get; set; } = new List<PaymentTransaction>();
}
