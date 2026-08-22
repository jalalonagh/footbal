using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Domain.Entities;

public class TrainingResult : BaseEntity
{
    public Guid TrainingSessionId { get; set; }
    public TrainingSession TrainingSession { get; set; } = null!;
    public Guid PlayerProfileId { get; set; }
    public PlayerProfile PlayerProfile { get; set; } = null!;
    public decimal OverallScore { get; set; }
    public decimal PositioningScore { get; set; }
    public decimal MovementScore { get; set; }
    public decimal TimingScore { get; set; }
    public decimal AwarenessScore { get; set; }
    public decimal DecisionScore { get; set; }
    public MistakeType? MistakeType { get; set; }
    public string? MistakeDescription { get; set; }
    public string? CoachingExplanation { get; set; }
    public string? OptimalPathJson { get; set; }
    public string? UserPathJson { get; set; }
    public DateTime CompletedAt { get; set; }
}
