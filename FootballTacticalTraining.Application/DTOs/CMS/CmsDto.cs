using System.ComponentModel.DataAnnotations;

namespace FootballTacticalTraining.Application.DTOs.CMS;

public class CreateArticleDto
{
    [Required]
    [StringLength(300, MinimumLength = 5)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Summary { get; set; }

    [StringLength(500)]
    public string? CoverImageUrl { get; set; }

    [StringLength(100)]
    public string? Category { get; set; }

    [StringLength(2000)]
    public string? Tags { get; set; }
}

public class UpdateArticleDto
{
    [Required]
    [StringLength(300, MinimumLength = 5)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Summary { get; set; }

    [StringLength(500)]
    public string? CoverImageUrl { get; set; }

    [StringLength(100)]
    public string? Category { get; set; }
}

public class CreateFaqDto
{
    [Required]
    [StringLength(500, MinimumLength = 10)]
    public string Question { get; set; } = string.Empty;

    [Required]
    public string Answer { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Category { get; set; }

    [StringLength(10)]
    public string Language { get; set; } = "en";
}

public class UpdateFaqDto
{
    [Required]
    [StringLength(500, MinimumLength = 10)]
    public string Question { get; set; } = string.Empty;

    [Required]
    public string Answer { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Category { get; set; }

    public int? DisplayOrder { get; set; }
}
