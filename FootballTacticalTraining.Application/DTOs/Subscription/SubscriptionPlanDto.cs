namespace FootballTacticalTraining.Application.DTOs.Subscription;

public class SubscriptionPlanDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationDays { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string Currency { get; set; } = "IRR";
    public bool IsActive { get; set; }
    public List<FeatureDto> Features { get; set; } = new();
}

public class FeatureDto
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public int? Limit { get; set; }
}