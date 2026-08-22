using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Application.DTOs.Scenario;

public class ScenarioDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ScenarioCategory Category { get; set; }
    public DifficultyLevel Difficulty { get; set; }
    public string? Formation { get; set; }
    public GamePhase GamePhase { get; set; }
    public int GameMinute { get; set; }
    public int HomeScore { get; set; }
    public int AwayScore { get; set; }
    public ScenarioState Status { get; set; }
    public TrainingMode TrainingMode { get; set; }
    public int PlayerCount { get; set; }
    public bool IsPublic { get; set; }
}