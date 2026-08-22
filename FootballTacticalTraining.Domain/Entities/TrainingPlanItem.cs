namespace FootballTacticalTraining.Domain.Entities;

public class TrainingPlanItem : BaseEntity
{
    public Guid TrainingPlanId { get; set; }
    public TrainingPlan TrainingPlan { get; set; } = null!;
    public int DayNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ScenarioId { get; set; }
    public Scenario? Scenario { get; set; }
    public int Duration { get; set; }
    public bool IsCompleted { get; set; }
    public int DisplayOrder { get; set; }
}
