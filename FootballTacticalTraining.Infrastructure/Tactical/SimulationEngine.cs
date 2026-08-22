using FootballTacticalTraining.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace FootballTacticalTraining.Infrastructure.Tactical;

public class SimulationEngine : ISimulationEngine
{
    private readonly ILogger<SimulationEngine> _logger;
    private const decimal MaxSpeed = 8m;
    private const decimal BallSpeed = 15m;
    private const decimal Friction = 0.85m;
    private const decimal PitchMin = 0m;
    private const decimal PitchMax = 100m;

    public SimulationEngine(ILogger<SimulationEngine> logger) { _logger = logger; }

    public Task<SimulationState> InitializeSimulationAsync(GameState initialState)
    {
        var state = new SimulationState
        {
            CurrentTime = initialState.Time,
            BallX = initialState.BallX,
            BallY = initialState.BallY,
            BallVX = 0,
            BallVY = 0,
            Players = initialState.Players.Select(p => new SimPlayerState
            {
                Id = p.Id,
                TeamId = p.TeamId,
                X = p.X,
                Y = p.Y,
                VX = 0,
                VY = 0,
                Speed = p.Speed > 0 ? p.Speed : MaxSpeed,
                HasBall = p.HasBall
            }).ToList()
        };
        return Task.FromResult(state);
    }

    public async Task<SimulationResult> RunSimulationAsync(SimulationRequest request)
    {
        var state = await InitializeSimulationAsync(request.InitialState);
        var result = new SimulationResult();

        var steps = (int)(request.DurationSeconds / request.TimeStepSeconds);
        for (int i = 0; i < steps; i++)
        {
            var step = await StepSimulationAsync(state, request.TimeStepSeconds);
            result.Steps.Add(step);
            state = step.State;

            if (step.IsFinished) break;
        }

        result.FinalTime = state.CurrentTime;
        result.TotalSteps = result.Steps.Count;
        result.Summary = $"Simulation completed in {result.FinalTime:F1}s with {result.TotalSteps} steps";
        return result;
    }

    public Task<SimulationStep> StepSimulationAsync(SimulationState state, decimal deltaTime)
    {
        var events = new List<string>();
        var newState = CloneState(state);
        newState.CurrentTime += deltaTime;

        bool anyPlayerHasBall = newState.Players.Any(p => p.HasBall);

        foreach (var player in newState.Players)
        {
            if (player.HasBall)
            {
                MoveBall(newState, deltaTime);
            }
            else
            {
                MovePlayerTowardsBall(player, newState, deltaTime);
            }
        }

        if (!anyPlayerHasBall)
        {
            MoveBall(newState, deltaTime);
        }

        CheckCollisions(newState, events);
        CheckBallOutOfBounds(newState, events);

        if (newState.CurrentTime >= 90)
        {
            newState.IsFinished = true;
            events.Add("Full time");
        }

        return Task.FromResult(new SimulationStep
        {
            State = newState,
            Events = events,
            IsFinished = newState.IsFinished
        });
    }

    private void MoveBall(SimulationState state, decimal dt)
    {
        state.BallX += state.BallVX * dt;
        state.BallY += state.BallVY * dt;
        state.BallVX *= Friction;
        state.BallVY *= Friction;
        state.BallX = Clamp(state.BallX);
        state.BallY = Clamp(state.BallY);
    }

    private void MovePlayerTowardsBall(SimPlayerState player, SimulationState state, decimal dt)
    {
        var dx = state.BallX - player.X;
        var dy = state.BallY - player.Y;
        var dist = Math.Sqrt((double)(dx * dx + dy * dy));
        if (dist < 0.5) return;

        var speed = Math.Min(player.Speed, MaxSpeed);
        player.VX = (dx / (decimal)dist) * speed;
        player.VY = (dy / (decimal)dist) * speed;
        player.X += player.VX * dt;
        player.Y += player.VY * dt;
        player.X = Clamp(player.X);
        player.Y = Clamp(player.Y);
    }

    private void CheckCollisions(SimulationState state, List<string> events)
    {
        foreach (var player in state.Players)
        {
            var dist = Distance(player.X, player.Y, state.BallX, state.BallY);
            if (dist < 3m && !player.HasBall)
            {
                var prev = state.Players.FirstOrDefault(p => p.HasBall);
                if (prev != null) prev.HasBall = false;
                player.HasBall = true;
                state.BallVX = 0;
                state.BallVY = 0;
                events.Add($"Player {player.Id} won the ball");
            }
        }
    }

    private void CheckBallOutOfBounds(SimulationState state, List<string> events)
    {
        if (state.BallX <= PitchMin || state.BallX >= PitchMax)
        {
            state.BallX = Clamp(state.BallX);
            state.BallVX = -state.BallVX * 0.5m;
            events.Add("Ball hit sideline");
        }
        if (state.BallY <= PitchMin || state.BallY >= PitchMax)
        {
            state.BallY = Clamp(state.BallY);
            state.BallVY = -state.BallVY * 0.5m;
            events.Add("Ball hit touchline");
        }
    }

    private static decimal Clamp(decimal v) => Math.Max(PitchMin, Math.Min(PitchMax, v));
    private static decimal Distance(decimal x1, decimal y1, decimal x2, decimal y2) =>
        (decimal)Math.Sqrt((double)((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)));

    private SimulationState CloneState(SimulationState s) => new()
    {
        CurrentTime = s.CurrentTime,
        BallX = s.BallX, BallY = s.BallY,
        BallVX = s.BallVX, BallVY = s.BallVY,
        IsFinished = s.IsFinished,
        Players = s.Players.Select(p => new SimPlayerState
        {
            Id = p.Id, TeamId = p.TeamId,
            X = p.X, Y = p.Y,
            VX = p.VX, VY = p.VY,
            Speed = p.Speed, HasBall = p.HasBall
        }).ToList()
    };
}
