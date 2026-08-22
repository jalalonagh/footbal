using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Domain.Entities.Subscriptions;

public class Subscription : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid PlanId { get; set; }
    public SubscriptionPlan Plan { get; set; } = null!;
    public SubscriptionStatus Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool AutoRenew { get; set; }
    public Guid? PaymentId { get; set; }
    public Payment? Payment { get; set; }
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
