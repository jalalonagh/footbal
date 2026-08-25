using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Domain.Entities.CMS;

public class Article : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public Guid? AuthorId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string? CoverImageAlt { get; set; }
    public ContentType ContentType { get; set; } = ContentType.Article;
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
    public int ViewCount { get; set; } = 0;
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }
    public SeoPage? SeoPage { get; set; }

    // SEO fields
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? FocusKeyword { get; set; }
    public string? Keywords { get; set; }
    public string? CanonicalUrl { get; set; }
    public string? SchemaJson { get; set; }
    public int ReadingTimeMinutes { get; set; } = 0;
    public string? Excerpt { get; set; }

    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
    public ICollection<ArticleTag> ArticleTags { get; set; } = new List<ArticleTag>();
    public ICollection<ArticleTranslation> Translations { get; set; } = new List<ArticleTranslation>();
}
