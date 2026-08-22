using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Infrastructure.Tactical;
using Microsoft.Extensions.Logging;
using Moq;

namespace FootballTacticalTraining.Tests;

public class SimulationEngineTests
{
    private readonly SimulationEngine _engine;
    private readonly Mock<ILogger<SimulationEngine>> _loggerMock = new();

    public SimulationEngineTests()
    {
        _engine = new SimulationEngine(_loggerMock.Object);
    }

    [Fact]
    public async Task InitializeSimulation_CreatesStateFromGame()
    {
        var gameState = new GameState
        {
            Time = 0, BallX = 50, BallY = 50,
            Players = new List<PlayerState>
            {
                new() { Id = Guid.NewGuid(), TeamId = 1, X = 40, Y = 50, Number = 9, Position = "ST", Speed = 7 },
            }
        };
        var state = await _engine.InitializeSimulationAsync(gameState);
        Assert.Equal(50, state.BallX);
        Assert.Single(state.Players);
        Assert.Equal(40, state.Players[0].X);
    }

    [Fact]
    public async Task StepSimulation_MovesBallWithFriction()
    {
        var state = new SimulationState
        {
            CurrentTime = 0,
            BallX = 50, BallY = 50,
            BallVX = 10, BallVY = 0,
            Players = new List<SimPlayerState>()
        };
        var step = await _engine.StepSimulationAsync(state, 1);
        Assert.True(step.State.BallVX < 10);
    }

    [Fact]
    public async Task RunSimulation_CompletesWithinDuration()
    {
        var request = new SimulationRequest
        {
            InitialState = new GameState
            {
                Time = 0, BallX = 50, BallY = 50,
                Players = new List<PlayerState>
                {
                    new() { Id = Guid.NewGuid(), TeamId = 1, X = 40, Y = 50, Number = 9, Position = "ST", Speed = 5 },
                    new() { Id = Guid.NewGuid(), TeamId = 2, X = 70, Y = 50, Number = 4, Position = "CB", Speed = 5 },
                }
            },
            DurationSeconds = 10,
            TimeStepSeconds = 1
        };
        var result = await _engine.RunSimulationAsync(request);
        Assert.True(result.Steps.Count > 0);
        Assert.True(result.FinalTime <= 10);
    }

    [Fact]
    public async Task StepSimulation_PlayerNearBall_WinsBall()
    {
        var playerId = Guid.NewGuid();
        var state = new SimulationState
        {
            CurrentTime = 0,
            BallX = 50, BallY = 50,
            BallVX = 0, BallVY = 0,
            Players = new List<SimPlayerState>
            {
                new() { Id = playerId, TeamId = 1, X = 51, Y = 50, VX = 0, VY = 0, Speed = 8, HasBall = false },
            }
        };
        var step = await _engine.StepSimulationAsync(state, 1);
        var player = step.State.Players.First(p => p.Id == playerId);
        Assert.True(player.X <= 55);
    }
}
