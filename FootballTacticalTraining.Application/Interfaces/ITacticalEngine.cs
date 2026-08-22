using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Application.Interfaces;

public interface ITacticalEngine
{
    Task<TacticalAnalysis> AnalyzeSituationAsync(GameState gameState);
    Task<TacticalRecommendation> GetRecommendedActionAsync(GameState gameState, Guid playerId);
    Task<List<TacticalRecommendation>> GetAllPossibleActionsAsync(GameState gameState, Guid playerId);
}

public class GameState
{
    public decimal Time { get; set; }
    public decimal BallX { get; set; }
    public decimal BallY { get; set; }
    public List<PlayerState> Players { get; set; } = new();
    public string Phase { get; set; } = string.Empty;
    public Guid? TargetPlayerId { get; set; }
}

public class PlayerState
{
    public Guid Id { get; set; }
    public int TeamId { get; set; }
    public int Number { get; set; }
    public string Position { get; set; } = string.Empty;
    public decimal X { get; set; }
    public decimal Y { get; set; }
    public decimal Direction { get; set; }
    public decimal Speed { get; set; }
    public bool HasBall { get; set; }
    public bool IsTarget { get; set; }
}

public class TacticalAnalysis
{
    public decimal SpaceBehindDefense { get; set; }
    public bool PassingLaneAvailable { get; set; }
    public decimal PressureLevel { get; set; }
    public string DefensiveLineHeight { get; set; } = string.Empty;
    public decimal DistanceToGoal { get; set; }
    public string? RecommendedZone { get; set; }
}

public class TacticalRecommendation
{
    public string ActionType { get; set; } = string.Empty;
    public decimal TargetX { get; set; }
    public decimal TargetY { get; set; }
    public decimal Score { get; set; }
    public string? Description { get; set; }
    public string? CoachingTip { get; set; }
}
