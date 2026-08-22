namespace FootballTacticalTraining.Domain.Entities.Subscriptions;

public class Feature : BaseEntity
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsPremium { get; set; }
    public int? DefaultValue { get; set; }
    public string? Unit { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public ICollection<PlanFeature> PlanFeatures { get; set; } = new List<PlanFeature>();
}
