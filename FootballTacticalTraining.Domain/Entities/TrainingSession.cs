using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Domain.Entities;

public class TrainingSession : BaseEntity
{
    public Guid PlayerProfileId { get; set; }
    public PlayerProfile PlayerProfile { get; set; } = null!;
    public Guid? ScenarioId { get; set; }
    public Scenario? Scenario { get; set; }
    public Guid? TeamId { get; set; }
    public Team? Team { get; set; }
    public TrainingMode Mode { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public decimal OverallScore { get; set; }
    public int TotalDecisions { get; set; }
    public int CorrectDecisions { get; set; }
    public int WrongDecisions { get; set; }
    public bool IsCompleted { get; set; }
    public string? SessionDataJson { get; set; }
    public ICollection<TrainingResult> Results { get; set; } = new List<TrainingResult>();
    public ICollection<Decision> Decisions { get; set; } = new List<Decision>();
}
