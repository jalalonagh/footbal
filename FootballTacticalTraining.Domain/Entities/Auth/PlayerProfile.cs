using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Domain.Entities.Auth;

public class PlayerProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public FootballPosition PrimaryPosition { get; set; }
    public FootballPosition? SecondaryPosition { get; set; }
    public int Age { get; set; }
    public string? PreferredFoot { get; set; }
    public float TacticalIQ { get; set; }
    public float PositioningScore { get; set; }
    public float MovementScore { get; set; }
    public float TimingScore { get; set; }
    public float AwarenessScore { get; set; }
    public float DecisionMakingScore { get; set; }
    public float BallControlScore { get; set; }
    public float OffBallMovementScore { get; set; }
    public ICollection<PlayerProgress> Progress { get; set; } = new List<PlayerProgress>();
    public ICollection<TrainingResult> TrainingResults { get; set; } = new List<TrainingResult>();
}
