using FootballTacticalTraining.Domain.Entities.Subscriptions;

namespace FootballTacticalTraining.Domain.Entities.CMS;

public class Discount : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? Percentage { get; set; }
    public decimal? FixedAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public int? UsageLimit { get; set; }
    public int UsedCount { get; set; } = 0;
    public Guid? PlanId { get; set; }
    public SubscriptionPlan? Plan { get; set; }
}
