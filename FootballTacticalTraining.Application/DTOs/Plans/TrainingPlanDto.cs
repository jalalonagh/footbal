using System.ComponentModel.DataAnnotations;

namespace FootballTacticalTraining.Application.DTOs.Plans;

public class CreateTrainingPlanDto
{
    [Required(ErrorMessage = "Plan name is required")]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public Guid? PlayerProfileId { get; set; }
    public Guid? TeamId { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class UpdateTrainingPlanDto
{
    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public bool? IsActive { get; set; }
}

public class AddPlanItemDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public Guid? ScenarioId { get; set; }

    [Range(5, 180)]
    public int Duration { get; set; } = 30;
}
