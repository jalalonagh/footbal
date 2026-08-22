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
    public ContentType ContentType { get; set; } = ContentType.Article;
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
    public int ViewCount { get; set; } = 0;
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }
    public SeoPage? SeoPage { get; set; }
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
    public ICollection<ArticleTag> ArticleTags { get; set; } = new List<ArticleTag>();
}
