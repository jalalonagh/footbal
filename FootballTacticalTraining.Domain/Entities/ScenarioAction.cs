using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Domain.Entities;

public class ScenarioAction : BaseEntity
{
    public Guid SolutionId { get; set; }
    public ScenarioSolution Solution { get; set; } = null!;
    public TacticalActionType ActionType { get; set; }
    public decimal TargetX { get; set; }
    public decimal TargetY { get; set; }
    public decimal Timing { get; set; }
    public int Order { get; set; }
    public string? Description { get; set; }
}