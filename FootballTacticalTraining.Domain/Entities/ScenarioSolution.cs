using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Domain.Entities;

public class ScenarioSolution : BaseEntity
{
    public Guid ScenarioId { get; set; }
    public Scenario Scenario { get; set; } = null!;
    public ScenarioSolutionType SolutionType { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal OptimalX { get; set; }
    public decimal OptimalY { get; set; }
    public decimal Score { get; set; }
    public string? MovementPath { get; set; }
    public string? CoachingExplanation { get; set; }
    public ICollection<ScenarioAction> Actions { get; set; } = new List<ScenarioAction>();
}