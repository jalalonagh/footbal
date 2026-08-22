namespace FootballTacticalTraining.Domain.Entities.Subscriptions;

public class SubscriptionPlan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DurationDays { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string Currency { get; set; } = "IRR";
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
    public string? StripePriceId { get; set; }
    public ICollection<PlanFeature> PlanFeatures { get; set; } = new List<PlanFeature>();
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}
