using System.ComponentModel.DataAnnotations;

namespace FootballTacticalTraining.Application.DTOs.Academies;

public class CreateAcademyDto
{
    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [StringLength(500)]
    public string? LogoUrl { get; set; }

    [EmailAddress]
    public string? ContactEmail { get; set; }

    [Phone]
    public string? ContactPhone { get; set; }

    [StringLength(300)]
    public string? Address { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(100)]
    public string? Province { get; set; }

    [StringLength(100)]
    public string? Country { get; set; }

    [StringLength(300)]
    public string? Website { get; set; }

    [StringLength(200)]
    public string? Instagram { get; set; }

    [StringLength(200)]
    public string? Telegram { get; set; }

    public int? FoundedYear { get; set; }

    [StringLength(500)]
    public string? AgeGroups { get; set; }

    [StringLength(500)]
    public string? PlayingStyle { get; set; }

    [StringLength(1000)]
    public string? Facilities { get; set; }

    public int? MinAge { get; set; }
    public int? MaxAge { get; set; }
    public decimal? MonthlyFee { get; set; }
}

public class UpdateAcademyDto
{
    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [StringLength(500)]
    public string? LogoUrl { get; set; }

    [EmailAddress]
    public string? ContactEmail { get; set; }

    [Phone]
    public string? ContactPhone { get; set; }

    [StringLength(300)]
    public string? Address { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(100)]
    public string? Province { get; set; }

    [StringLength(100)]
    public string? Country { get; set; }

    [StringLength(300)]
    public string? Website { get; set; }

    [StringLength(200)]
    public string? Instagram { get; set; }

    [StringLength(200)]
    public string? Telegram { get; set; }

    public int? FoundedYear { get; set; }

    [StringLength(500)]
    public string? AgeGroups { get; set; }

    [StringLength(500)]
    public string? PlayingStyle { get; set; }

    [StringLength(1000)]
    public string? Facilities { get; set; }

    public int? MinAge { get; set; }
    public int? MaxAge { get; set; }
    public decimal? MonthlyFee { get; set; }
    public bool? IsActive { get; set; }
    public string? AdminNotes { get; set; }
}
