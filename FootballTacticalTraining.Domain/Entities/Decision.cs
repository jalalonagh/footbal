using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Domain.Entities;

public class Decision : BaseEntity
{
    public Guid TrainingSessionId { get; set; }
    public TrainingSession TrainingSession { get; set; } = null!;
    public TacticalActionType ActionType { get; set; }
    public decimal UserX { get; set; }
    public decimal UserY { get; set; }
    public decimal OptimalX { get; set; }
    public decimal OptimalY { get; set; }
    public decimal Score { get; set; }
    public decimal Timing { get; set; }
    public bool IsCorrect { get; set; }
    public MistakeType? MistakeType { get; set; }
    public string? Explanation { get; set; }
    public int Order { get; set; }
    public DateTime DecidedAt { get; set; }
}
