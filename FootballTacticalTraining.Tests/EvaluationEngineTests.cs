using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Infrastructure.Tactical;
using Microsoft.Extensions.Logging;
using Moq;

namespace FootballTacticalTraining.Tests;

public class EvaluationEngineTests
{
    private readonly EvaluationEngine _engine;
    private readonly Mock<ILogger<EvaluationEngine>> _loggerMock = new();

    public EvaluationEngineTests()
    {
        _engine = new EvaluationEngine(_loggerMock.Object);
    }

    [Fact]
    public async Task EvaluateDecision_PerfectPosition_HighScore()
    {
        var input = new DecisionInput
        {
            UserX = 50, UserY = 50,
            OptimalX = 50, OptimalY = 50,
            UserTiming = 1.5m, OptimalTiming = 1.5m,
            ActionType = "PASS"
        };
        var result = await _engine.EvaluateDecisionAsync(input);
        Assert.True(result.OverallScore >= 80);
        Assert.Null(result.MistakeType);
    }

    [Fact]
    public async Task EvaluateDecision_PoorPosition_LowScore()
    {
        var input = new DecisionInput
        {
            UserX = 0, UserY = 0,
            OptimalX = 100, OptimalY = 100,
            UserTiming = 5m, OptimalTiming = 1m,
            ActionType = "RUN_IN_BEHIND"
        };
        var result = await _engine.EvaluateDecisionAsync(input);
        Assert.True(result.OverallScore < 60);
        Assert.NotNull(result.MistakeType);
    }

    [Fact]
    public async Task EvaluatePosition_CloseDistance_HighScore()
    {
        var result = await _engine.EvaluatePositionAsync(50, 50, 52, 50);
        Assert.True(result.Score >= 80);
        Assert.Equal("Excellent", result.Quality);
    }

    [Fact]
    public async Task EvaluatePosition_FarDistance_LowScore()
    {
        var result = await _engine.EvaluatePositionAsync(0, 0, 100, 100);
        Assert.True(result.Score < 30);
        Assert.Equal("Poor", result.Quality);
    }

    [Fact]
    public async Task EvaluateTiming_PerfectTiming_HighScore()
    {
        var result = await _engine.EvaluateTimingAsync(1.5m, 1.5m);
        Assert.True(result.Score >= 90);
        Assert.Equal("Perfect Timing", result.Quality);
    }

    [Fact]
    public async Task EvaluateTiming_LateMovement_NegativeDelay()
    {
        var result = await _engine.EvaluateTimingAsync(3m, 1.5m);
        Assert.True(result.Delay > 0);
        Assert.Equal("Late Movement", result.Quality);
    }

    [Fact]
    public async Task EvaluateTiming_EarlyMovement_NegativeDelay()
    {
        var result = await _engine.EvaluateTimingAsync(0.5m, 1.5m);
        Assert.True(result.Delay <= 0);
        Assert.Contains(result.Quality, new[] { "Early Movement", "Perfect Timing", "Good Timing" });
    }
}
