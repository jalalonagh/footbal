using FootballTacticalTraining.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace FootballTacticalTraining.Infrastructure.Tactical;

public class EvaluationEngine : IEvaluationEngine
{
    private readonly ILogger<EvaluationEngine> _logger;

    public EvaluationEngine(ILogger<EvaluationEngine> logger) { _logger = logger; }

    public async Task<EvaluationResult> EvaluateDecisionAsync(DecisionInput input)
    {
        var posEval = await EvaluatePositionAsync(input.UserX, input.UserY, input.OptimalX, input.OptimalY);
        var timingEval = await EvaluateTimingAsync(input.UserTiming, input.OptimalTiming);

        var overallScore = (posEval.Score * 0.5m) + (timingEval.Score * 0.3m) + CalculateActionScore(input) * 0.2m;

        string? mistakeType = null;
        if (posEval.Score < 50) mistakeType = "POSITIONING_ERROR";
        else if (timingEval.Score < 50) mistakeType = "TIMING_ERROR";
        else if (overallScore < 40) mistakeType = "DECISION_ERROR";

        return new EvaluationResult
        {
            OverallScore = Math.Round(overallScore, 1),
            PositionScore = posEval.Score,
            TimingScore = timingEval.Score,
            MovementScore = CalculateMovementScore(input),
            MistakeType = mistakeType,
            Explanation = GenerateExplanation(posEval, timingEval, overallScore, input),
            BestAlternative = overallScore < 60 ? "Try a different approach" : null
        };
    }

    public Task<PositionEvaluation> EvaluatePositionAsync(decimal userX, decimal userY, decimal optimalX, decimal optimalY)
    {
        var distance = (decimal)Math.Sqrt((double)((optimalX - userX) * (optimalX - userX) + (optimalY - userY) * (optimalY - userY)));
        var score = Math.Max(0, 100 - distance * 3);
        string quality = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Poor";
        return Task.FromResult(new PositionEvaluation { Score = Math.Round(score, 1), Distance = Math.Round(distance, 2), Quality = quality });
    }

    public Task<TimingEvaluation> EvaluateTimingAsync(decimal userTiming, decimal optimalTiming)
    {
        var delay = userTiming - optimalTiming;
        var absDelay = Math.Abs(delay);
        var score = Math.Max(0, 100 - absDelay * 30);
        string quality = score >= 80 ? "Perfect Timing" : score >= 60 ? "Good Timing" : delay > 0 ? "Late Movement" : "Early Movement";
        return Task.FromResult(new TimingEvaluation { Score = Math.Round(score, 1), Delay = Math.Round(delay, 2), Quality = quality });
    }

    private decimal CalculateActionScore(DecisionInput input)
    {
        if (input.HasBall)
        {
            return input.ActionType switch
            {
                "PASS" or "THROUGH_PASS" => 80,
                "DRIBBLE" => 70,
                "SHOOT" => 75,
                "HOLD_POSSESSION" => 60,
                "CROSS" => 65,
                _ => 50
            };
        }
        return input.ActionType switch
        {
            "RUN_IN_BEHIND" => 85,
            "CHECK_TO_BALL" => 70,
            "CREATE_SPACE" => 75,
            "HOLD_POSITION" => 50,
            _ => 55
        };
    }

    private decimal CalculateMovementScore(DecisionInput input)
    {
        var distance = (decimal)Math.Sqrt((double)((input.OptimalX - input.UserX) * (input.OptimalX - input.UserX) + (input.OptimalY - input.UserY) * (input.OptimalY - input.UserY)));
        return Math.Max(0, 100 - distance * 2);
    }

    private string GenerateExplanation(PositionEvaluation pos, TimingEvaluation timing, decimal overall, DecisionInput input)
    {
        if (overall >= 80) return "Excellent decision! Great positioning and timing.";
        if (overall >= 60) return "Good decision. Minor improvements possible in positioning.";
        if (pos.Score < 50) return "Your position was off by " + pos.Distance + " units. Try to be closer to the optimal zone.";
        if (timing.Score < 50) return "Movement was " + timing.Quality.ToLower() + ". Optimal timing is " + Math.Abs(timing.Delay).ToString("F1") + "s.";
        return "Review the tactical situation and consider alternatives.";
    }
}
