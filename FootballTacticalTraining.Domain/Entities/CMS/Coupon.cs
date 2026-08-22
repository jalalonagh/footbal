namespace FootballTacticalTraining.Domain.Entities.CMS;

public class Coupon : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid DiscountId { get; set; }
    public Discount Discount { get; set; } = null!;
    public int? MaxUses { get; set; }
    public int CurrentUses { get; set; } = 0;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public decimal? MinAmount { get; set; }
}
