using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Domain.Entities;

public class ScenarioPlayer : BaseEntity
{
    public Guid ScenarioId { get; set; }
    public Scenario Scenario { get; set; } = null!;
    public int Number { get; set; }
    public FootballPosition Position { get; set; }
    public string? Role { get; set; }
    public decimal StartX { get; set; }
    public decimal StartY { get; set; }
    public decimal? Direction { get; set; }
    public decimal Speed { get; set; } = 1;
    public decimal Acceleration { get; set; } = 1;
    public bool HasBall { get; set; }
    public bool IsTarget { get; set; }
    public bool IsDefender { get; set; }
    public int TeamId { get; set; }
}