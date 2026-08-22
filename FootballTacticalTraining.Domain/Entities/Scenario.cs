using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Domain.Entities.CMS;

namespace FootballTacticalTraining.Domain.Entities;

public class Scenario : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ScenarioCategory Category { get; set; }
    public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Beginner;
    public string? Formation { get; set; }
    public GamePhase GamePhase { get; set; }
    public int GameMinute { get; set; }
    public int HomeScore { get; set; }
    public int AwayScore { get; set; }
    public ScenarioState Status { get; set; } = ScenarioState.Draft;
    public int Version { get; set; } = 1;
    public TrainingMode TrainingMode { get; set; } = TrainingMode.Practice;
    public bool IsPublic { get; set; }
    public Guid? CreatedByCoachId { get; set; }
    
    public ICollection<ScenarioPlayer> Players { get; set; } = new List<ScenarioPlayer>();
    public ICollection<ScenarioSolution> Solutions { get; set; } = new List<ScenarioSolution>();
    public ICollection<ScenarioRule> Rules { get; set; } = new List<ScenarioRule>();
    public ICollection<TrainingSession> TrainingSessions { get; set; } = new List<TrainingSession>();
    public SeoPage? SeoPage { get; set; }
}