using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Domain.Entities.CMS;

public class ArticleTranslation : BaseEntity
{
    public Guid ArticleId { get; set; }
    public Article Article { get; set; } = null!;

    public Language Language { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string Slug { get; set; } = string.Empty;

    // SEO fields per language
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? FocusKeyword { get; set; }
    public string? Keywords { get; set; }
    public string? Excerpt { get; set; }
}
