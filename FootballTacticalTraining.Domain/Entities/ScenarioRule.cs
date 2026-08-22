namespace FootballTacticalTraining.Domain.Entities;

public class ScenarioRule : BaseEntity
{
    public Guid ScenarioId { get; set; }
    public Scenario Scenario { get; set; } = null!;
    public string ConditionJson { get; set; } = "{}";
    public string ActionJson { get; set; } = "{}";
    public int Priority { get; set; }
    public bool IsActive { get; set; } = true;
}