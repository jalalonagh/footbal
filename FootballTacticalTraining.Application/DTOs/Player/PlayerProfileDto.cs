using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Application.DTOs.Player;

public class PlayerProfileDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
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
}