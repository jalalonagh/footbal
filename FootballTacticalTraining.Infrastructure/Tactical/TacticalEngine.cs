using FootballTacticalTraining.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace FootballTacticalTraining.Infrastructure.Tactical;

public class TacticalEngine : ITacticalEngine
{
    private readonly ILogger<TacticalEngine> _logger;

    public TacticalEngine(ILogger<TacticalEngine> logger) { _logger = logger; }

    public Task<TacticalAnalysis> AnalyzeSituationAsync(GameState gameState)
    {
        var defenders = gameState.Players.Where(p => p.TeamId == 2).ToList();
        var attackers = gameState.Players.Where(p => p.TeamId == 1).ToList();
        var target = gameState.Players.FirstOrDefault(p => p.IsTarget);

        var analysis = new TacticalAnalysis();

        if (defenders.Any())
        {
            var avgDefY = defenders.Average(d => d.Y);
            analysis.DefensiveLineHeight = avgDefY > 70 ? "HIGH" : avgDefY > 40 ? "MID" : "LOW";
            analysis.SpaceBehindDefense = Math.Max(0, 100 - defenders.Max(d => d.Y));
        }

        if (target != null && defenders.Any())
        {
            analysis.DistanceToGoal = CalculateDistance(target.X, target.Y, 100, 50);
            analysis.PressureLevel = CalculatePressureLevel(target, defenders);
            analysis.PassingLaneAvailable = IsPassingLaneOpen(target, gameState.BallX, gameState.BallY, defenders);
        }

        return Task.FromResult(analysis);
    }

    public async Task<TacticalRecommendation> GetRecommendedActionAsync(GameState gameState, Guid playerId)
    {
        var player = gameState.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null) return new TacticalRecommendation { ActionType = "HOLD_POSITION", Score = 0 };

        var defenders = gameState.Players.Where(p => p.TeamId != player.TeamId).ToList();
        var analysis = await AnalyzeSituationAsync(gameState);

        var recommendations = GenerateRecommendations(player, defenders, analysis, gameState);
        return recommendations.OrderByDescending(r => r.Score).FirstOrDefault() ?? new TacticalRecommendation { ActionType = "HOLD_POSITION", Score = 50 };
    }

    public async Task<List<TacticalRecommendation>> GetAllPossibleActionsAsync(GameState gameState, Guid playerId)
    {
        var player = gameState.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null) return new List<TacticalRecommendation>();

        var defenders = gameState.Players.Where(p => p.TeamId != player.TeamId).ToList();
        var analysis = await AnalyzeSituationAsync(gameState);
        var recommendations = GenerateRecommendations(player, defenders, analysis, gameState);

        return recommendations.OrderByDescending(r => r.Score).ToList();
    }

    private List<TacticalRecommendation> GenerateRecommendations(Application.Interfaces.PlayerState player, List<Application.Interfaces.PlayerState> defenders, TacticalAnalysis analysis, GameState state)
    {
        var recommendations = new List<TacticalRecommendation>();
        bool hasBall = state.BallX == player.X && state.BallY == player.Y;

        if (hasBall)
        {
            recommendations.Add(new TacticalRecommendation { ActionType = "PASS", TargetX = FindBestPassTargetX(player, state), TargetY = FindBestPassTargetY(player, state), Score = analysis.PassingLaneAvailable ? 85 : 60, Description = "Pass to teammate", CoachingTip = "Look for the open teammate" });
            recommendations.Add(new TacticalRecommendation { ActionType = "DRIBBLE", TargetX = player.X + 5, TargetY = player.Y, Score = analysis.PressureLevel < 30 ? 80 : 40, Description = "Dribble forward", CoachingTip = "Attack the space" });
            if (analysis.DistanceToGoal < 30) recommendations.Add(new TacticalRecommendation { ActionType = "SHOOT", TargetX = 100, TargetY = 50, Score = 75, Description = "Shoot at goal", CoachingTip = "Take the shot" });
            recommendations.Add(new TacticalRecommendation { ActionType = "HOLD_POSSESSION", TargetX = player.X, TargetY = player.Y, Score = 50, Description = "Hold the ball", CoachingTip = "Protect the ball" });
        }
        else
        {
            if (analysis.SpaceBehindDefense > 20) recommendations.Add(new TacticalRecommendation { ActionType = "RUN_IN_BEHIND", TargetX = 85, TargetY = player.Y, Score = 90, Description = "Run behind defense", CoachingTip = "Exploit space behind" });
            recommendations.Add(new TacticalRecommendation { ActionType = "CHECK_TO_BALL", TargetX = state.BallX, TargetY = state.BallY, Score = 70, Description = "Check to ball", CoachingTip = "Come short for the ball" });
            recommendations.Add(new TacticalRecommendation { ActionType = "CREATE_SPACE", TargetX = player.X + (player.X > 50 ? 10 : -10), TargetY = player.Y, Score = 65, Description = "Create space", CoachingTip = "Move to open space" });
            recommendations.Add(new TacticalRecommendation { ActionType = "HOLD_POSITION", TargetX = player.X, TargetY = player.Y, Score = 40, Description = "Hold position", CoachingTip = "Stay in position" });
        }

        return recommendations;
    }

    private decimal CalculatePressureLevel(Application.Interfaces.PlayerState player, List<Application.Interfaces.PlayerState> defenders)
    {
        var nearestDefender = defenders.OrderBy(d => CalculateDistance(player.X, player.Y, d.X, d.Y)).FirstOrDefault();
        if (nearestDefender == null) return 0;
        var distance = CalculateDistance(player.X, player.Y, nearestDefender.X, nearestDefender.Y);
        return Math.Max(0m, 100 - distance * 5);
    }

    private bool IsPassingLaneOpen(Application.Interfaces.PlayerState player, decimal ballX, decimal ballY, List<Application.Interfaces.PlayerState> defenders)
    {
        foreach (var defender in defenders)
        {
            if (IsPointNearLine(ballX, ballY, player.X, player.Y, defender.X, defender.Y, 5)) return false;
        }
        return true;
    }

    private bool IsPointNearLine(decimal x1, decimal y1, decimal x2, decimal y2, decimal px, decimal py, double threshold)
    {
        double dx = (double)(x2 - x1), dy = (double)(y2 - y1);
        double length = Math.Sqrt(dx * dx + dy * dy);
        if (length == 0) return CalculateDistance(px, py, x1, y1) < (decimal)threshold;
        double t = Math.Max(0, Math.Min(1, ((double)(px - x1) * dx + (double)(py - y1) * dy) / (length * length)));
        double projX = (double)x1 + t * dx, projY = (double)y1 + t * dy;
        return CalculateDistance(px, py, (decimal)projX, (decimal)projY) < (decimal)threshold;
    }

    private decimal FindBestPassTargetX(Application.Interfaces.PlayerState player, GameState state)
    {
        var teammates = state.Players.Where(p => p.TeamId == player.TeamId && p.Id != player.Id).ToList();
        return teammates.Any() ? teammates.OrderByDescending(t => 100 - t.X).First().X : player.X;
    }

    private decimal FindBestPassTargetY(Application.Interfaces.PlayerState player, GameState state)
    {
        var teammates = state.Players.Where(p => p.TeamId == player.TeamId && p.Id != player.Id).ToList();
        return teammates.Any() ? teammates.OrderByDescending(t => 100 - t.X).First().Y : player.Y;
    }

    private static decimal CalculateDistance(decimal x1, decimal y1, decimal x2, decimal y2)
    {
        return (decimal)Math.Sqrt((double)((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)));
    }
}
