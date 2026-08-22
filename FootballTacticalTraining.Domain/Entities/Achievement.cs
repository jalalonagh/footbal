namespace FootballTacticalTraining.Domain.Entities;

public class Achievement : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public string CriteriaJson { get; set; } = "{}";
    public int Points { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
}
