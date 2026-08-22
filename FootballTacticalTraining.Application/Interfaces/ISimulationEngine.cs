namespace FootballTacticalTraining.Application.Interfaces;

public interface ISimulationEngine
{
    Task<SimulationResult> RunSimulationAsync(SimulationRequest request);
    Task<SimulationStep> StepSimulationAsync(SimulationState state, decimal deltaTime);
    Task<SimulationState> InitializeSimulationAsync(GameState initialState);
}

public class SimulationRequest
{
    public GameState InitialState { get; set; } = new();
    public decimal DurationSeconds { get; set; } = 90;
    public decimal TimeStepSeconds { get; set; } = 1;
    public List<SimulationEvent> Events { get; set; } = new();
}

public class SimulationState
{
    public decimal CurrentTime { get; set; }
    public decimal BallX { get; set; }
    public decimal BallY { get; set; }
    public decimal BallVX { get; set; }
    public decimal BallVY { get; set; }
    public List<SimPlayerState> Players { get; set; } = new();
    public List<SimulationEvent> TriggeredEvents { get; set; } = new();
    public bool IsFinished { get; set; }
}

public class SimPlayerState
{
    public Guid Id { get; set; }
    public int TeamId { get; set; }
    public decimal X { get; set; }
    public decimal Y { get; set; }
    public decimal VX { get; set; }
    public decimal VY { get; set; }
    public decimal Speed { get; set; }
    public bool HasBall { get; set; }
}

public class SimulationStep
{
    public SimulationState State { get; set; } = new();
    public List<string> Events { get; set; } = new();
    public bool IsFinished { get; set; }
}

public class SimulationResult
{
    public List<SimulationStep> Steps { get; set; } = new();
    public decimal FinalTime { get; set; }
    public string Summary { get; set; } = string.Empty;
    public int TotalSteps { get; set; }
}

public class SimulationEvent
{
    public decimal Time { get; set; }
    public string EventType { get; set; } = string.Empty;
    public Guid? PlayerId { get; set; }
    public string? Data { get; set; }
}
