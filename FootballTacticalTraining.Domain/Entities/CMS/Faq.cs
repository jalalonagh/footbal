using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Domain.Entities.CMS;

public class Faq : BaseEntity
{
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public string? Category { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public Language Language { get; set; } = Language.English;
}
