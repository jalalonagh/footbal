namespace FootballTacticalTraining.Domain.Entities.Subscriptions;

public class PlanFeature : BaseEntity
{
    public Guid PlanId { get; set; }
    public SubscriptionPlan Plan { get; set; } = null!;
    public Guid FeatureId { get; set; }
    public Feature Feature { get; set; } = null!;
    public bool IsEnabled { get; set; } = true;
    public int? Limit { get; set; }
    public string? LimitUnit { get; set; }
}
