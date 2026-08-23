using System.ComponentModel.DataAnnotations;

namespace FootballTacticalTraining.Application.DTOs.Training;

public class StartSessionDto
{
    [Required(ErrorMessage = "Scenario ID is required")]
    public Guid ScenarioId { get; set; }

    [Required]
    public string Mode { get; set; } = "Individual";

    public Guid? TeamId { get; set; }
}

public class RecordDecisionDto
{
    [Required(ErrorMessage = "Action type is required")]
    [StringLength(50)]
    public string ActionType { get; set; } = string.Empty;

    [Required]
    [Range(0, 100)]
    public decimal UserX { get; set; }

    [Required]
    [Range(0, 100)]
    public decimal UserY { get; set; }

    [Required]
    [Range(0, 90)]
    public decimal UserTiming { get; set; }

    [Range(0, 100)]
    public decimal OptimalX { get; set; }

    [Range(0, 100)]
    public decimal OptimalY { get; set; }

    [Range(0, 90)]
    public decimal OptimalTiming { get; set; }

    [StringLength(500)]
    public string? ActionData { get; set; }
}
