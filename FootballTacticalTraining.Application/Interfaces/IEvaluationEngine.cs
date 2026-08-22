namespace FootballTacticalTraining.Application.Interfaces;

public interface IEvaluationEngine
{
    Task<EvaluationResult> EvaluateDecisionAsync(DecisionInput input);
    Task<PositionEvaluation> EvaluatePositionAsync(decimal userX, decimal userY, decimal optimalX, decimal optimalY);
    Task<TimingEvaluation> EvaluateTimingAsync(decimal userTiming, decimal optimalTiming);
}

public class DecisionInput
{
    public decimal UserX { get; set; }
    public decimal UserY { get; set; }
    public decimal OptimalX { get; set; }
    public decimal OptimalY { get; set; }
    public decimal UserTiming { get; set; }
    public decimal OptimalTiming { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public bool HasBall { get; set; }
    public decimal BallX { get; set; }
    public decimal BallY { get; set; }
}

public class EvaluationResult
{
    public decimal OverallScore { get; set; }
    public decimal PositionScore { get; set; }
    public decimal TimingScore { get; set; }
    public decimal MovementScore { get; set; }
    public string? MistakeType { get; set; }
    public string? Explanation { get; set; }
    public string? BestAlternative { get; set; }
}

public class PositionEvaluation
{
    public decimal Score { get; set; }
    public decimal Distance { get; set; }
    public string Quality { get; set; } = string.Empty;
}

public class TimingEvaluation
{
    public decimal Score { get; set; }
    public decimal Delay { get; set; }
    public string Quality { get; set; } = string.Empty;
}
