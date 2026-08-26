namespace FootballTacticalTraining.Domain.Entities;

public class Position : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameFa { get; set; }
    public string? Description { get; set; }
    public string? DescriptionFa { get; set; }
    public string? Requirements { get; set; }
    public string? RequirementsFa { get; set; }
    public string? IconUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Category { get; set; }

    public ICollection<UserPosition> UserPositions { get; set; } = new List<UserPosition>();
    public ICollection<PositionVideo> Videos { get; set; } = new List<PositionVideo>();
}
