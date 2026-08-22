using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Domain.Entities.Tactical;

public class TacticalRule : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string ConditionJson { get; set; } = "{}";
    public string ActionJson { get; set; } = "{}";
    public int Priority { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Category { get; set; }
    public DifficultyLevel? MinDifficulty { get; set; }
    public DifficultyLevel? MaxDifficulty { get; set; }
    public GamePhase? GamePhase { get; set; }
    public string? Position { get; set; }
}
