using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Domain.Entities.Subscriptions;

public class UserEntitlement : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid FeatureId { get; set; }
    public Feature Feature { get; set; } = null!;
    public EntitlementType Type { get; set; }
    public int? RemainingUsage { get; set; }
    public int? TotalUsage { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public Guid? SubscriptionId { get; set; }
    public Subscription? Subscription { get; set; }
}
