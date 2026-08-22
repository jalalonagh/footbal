namespace FootballTacticalTraining.Application.DTOs.Tactical;

public class TacticalSimulationDto
{
    public Guid ScenarioId { get; set; }
    public decimal UserX { get; set; }
    public decimal UserY { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public decimal Timing { get; set; }
}

public class TacticalSimulationResponseDto
{
    public decimal OverallScore { get; set; }
    public string? MistakeType { get; set; }
    public string? Explanation { get; set; }
    public string? BestAlternative { get; set; }
    public decimal OptimalX { get; set; }
    public decimal OptimalY { get; set; }
    public List<CoachingTipDto> Tips { get; set; } = new();
}

public class CoachingTipDto
{
    public string Category { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Detail { get; set; }
}