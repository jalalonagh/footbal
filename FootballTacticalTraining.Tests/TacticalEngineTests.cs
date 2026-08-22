using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Infrastructure.Tactical;
using Microsoft.Extensions.Logging;
using Moq;

namespace FootballTacticalTraining.Tests;

public class TacticalEngineTests
{
    private readonly TacticalEngine _engine;
    private readonly Mock<ILogger<TacticalEngine>> _loggerMock = new();

    public TacticalEngineTests()
    {
        _engine = new TacticalEngine(_loggerMock.Object);
    }

    [Fact]
    public async Task AnalyzeSituation_EmptyPlayers_ReturnsDefaults()
    {
        var gameState = new GameState { Players = new List<PlayerState>() };
        var result = await _engine.AnalyzeSituationAsync(gameState);
        Assert.NotNull(result);
        Assert.Equal(0, result.SpaceBehindDefense);
    }

    [Fact]
    public async Task AnalyzeSituation_WithDefenders_CalculatesDefensiveLine()
    {
        var gameState = new GameState
        {
            BallX = 50, BallY = 50,
            Players = new List<PlayerState>
            {
                new() { Id = Guid.NewGuid(), TeamId = 1, X = 30, Y = 50, Number = 9, Position = "ST", HasBall = false, IsTarget = true },
                new() { Id = Guid.NewGuid(), TeamId = 2, X = 70, Y = 30, Number = 4, Position = "CB" },
                new() { Id = Guid.NewGuid(), TeamId = 2, X = 75, Y = 70, Number = 5, Position = "CB" },
            }
        };
        var result = await _engine.AnalyzeSituationAsync(gameState);
        Assert.Equal("MID", result.DefensiveLineHeight);
        Assert.True(result.SpaceBehindDefense > 0);
        Assert.True(result.PressureLevel >= 0);
    }

    [Fact]
    public async Task GetRecommendedAction_UnknownPlayer_ReturnsHoldPosition()
    {
        var gameState = new GameState { Players = new List<PlayerState>() };
        var result = await _engine.GetRecommendedActionAsync(gameState, Guid.NewGuid());
        Assert.Equal("HOLD_POSITION", result.ActionType);
    }

    [Fact]
    public async Task GetAllPossibleActions_ReturnsRecommendations()
    {
        var playerId = Guid.NewGuid();
        var gameState = new GameState
        {
            BallX = 50, BallY = 50,
            Players = new List<PlayerState>
            {
                new() { Id = playerId, TeamId = 1, X = 40, Y = 50, Number = 9, Position = "ST" },
                new() { Id = Guid.NewGuid(), TeamId = 2, X = 70, Y = 50, Number = 4, Position = "CB" },
            }
        };
        var result = await _engine.GetAllPossibleActionsAsync(gameState, playerId);
        Assert.NotEmpty(result);
        Assert.True(result.Count >= 2);
    }

    [Fact]
    public async Task GetRecommendedAction_PlayerWithBall_SuggestsPassOrDribble()
    {
        var playerId = Guid.NewGuid();
        var gameState = new GameState
        {
            BallX = 40, BallY = 50,
            Players = new List<PlayerState>
            {
                new() { Id = playerId, TeamId = 1, X = 40, Y = 50, Number = 10, Position = "CAM", HasBall = true, IsTarget = true },
                new() { Id = Guid.NewGuid(), TeamId = 1, X = 60, Y = 30, Number = 7, Position = "RW" },
                new() { Id = Guid.NewGuid(), TeamId = 2, X = 70, Y = 50, Number = 4, Position = "CB" },
            }
        };
        var result = await _engine.GetRecommendedActionAsync(gameState, playerId);
        Assert.Contains(result.ActionType, new[] { "PASS", "DRIBBLE", "SHOOT", "HOLD_POSSESSION" });
    }
}
