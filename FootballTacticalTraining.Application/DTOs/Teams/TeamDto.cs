using System.ComponentModel.DataAnnotations;

namespace FootballTacticalTraining.Application.DTOs.Teams;

public class CreateTeamDto
{
    [Required(ErrorMessage = "Team name is required")]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(20)]
    public string? Formation { get; set; }

    public Guid? CoachProfileId { get; set; }
    public Guid? AcademyId { get; set; }
}

public class UpdateTeamDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(20)]
    public string? Formation { get; set; }
}

public class AddPlayerToTeamDto
{
    [Required(ErrorMessage = "Player profile ID is required")]
    public Guid PlayerProfileId { get; set; }

    [Required(ErrorMessage = "Position is required")]
    [StringLength(10)]
    public string Position { get; set; } = string.Empty;

    [Required]
    [Range(1, 99)]
    public int ShirtNumber { get; set; }
}
