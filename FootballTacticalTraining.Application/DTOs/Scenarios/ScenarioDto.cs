using System.ComponentModel.DataAnnotations;
using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Application.DTOs.Scenarios;

public class CreateScenarioDto
{
    [Required]
    [StringLength(200, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [Required]
    public string Category { get; set; } = string.Empty;

    public string Difficulty { get; set; } = "Intermediate";

    [StringLength(20)]
    public string? Formation { get; set; }

    public string? GamePhase { get; set; }

    public int GameMinute { get; set; } = 45;

    public string? TrainingMode { get; set; }
}

public class UpdateScenarioDto
{
    [Required]
    [StringLength(200, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    public string? Category { get; set; }
    public string? Difficulty { get; set; }

    [StringLength(20)]
    public string? Formation { get; set; }

    public string? GamePhase { get; set; }
    public int? GameMinute { get; set; }
}

public class ScenarioDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ScenarioCategory Category { get; set; }
    public DifficultyLevel Difficulty { get; set; }
    public string? Formation { get; set; }
    public GamePhase GamePhase { get; set; }
    public int GameMinute { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public ScenarioState Status { get; set; }
    public TrainingMode TrainingMode { get; set; }
    public int PlayerCount { get; set; }
    public bool IsPublic { get; set; }
    public List<ScenarioPlayerDto> Players { get; set; } = new();
}

public class ScenarioPlayerDto
{
    public Guid Id { get; set; }
    public int Number { get; set; }
    public string Position { get; set; } = string.Empty;
    public string? Role { get; set; }
    public decimal StartX { get; set; }
    public decimal StartY { get; set; }
    public int TeamId { get; set; }
    public decimal Speed { get; set; }
    public bool HasBall { get; set; }
    public bool IsTarget { get; set; }
}

public class CreateScenarioPlayerDto
{
    [Required]
    [Range(1, 99)]
    public int Number { get; set; }

    [Required]
    [StringLength(10)]
    public string Position { get; set; } = string.Empty;

    [StringLength(20)]
    public string? Role { get; set; }

    [Required]
    [Range(0, 100)]
    public decimal StartX { get; set; }

    [Required]
    [Range(0, 100)]
    public decimal StartY { get; set; }

    public int TeamId { get; set; } = 1;

    public decimal Direction { get; set; } = 1;
    public decimal Speed { get; set; } = 5;
    public bool HasBall { get; set; }
    public bool IsTarget { get; set; }
    public bool IsDefender { get; set; }
}

public class CreateScenarioSolutionDto
{
    [Required]
    public string SolutionType { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Range(0, 100)]
    public decimal OptimalX { get; set; }

    [Range(0, 100)]
    public decimal OptimalY { get; set; }

    [Range(0, 100)]
    public decimal Score { get; set; }

    [StringLength(2000)]
    public string? MovementPath { get; set; }

    [StringLength(2000)]
    public string? CoachingExplanation { get; set; }
}

public class CreateScenarioRuleDto
{
    [Required]
    public string ConditionJson { get; set; } = "{}";

    [Required]
    public string ActionJson { get; set; } = "{}";

    public int Priority { get; set; } = 1;
}
