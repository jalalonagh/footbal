namespace FootballTacticalTraining.Domain.Entities.CMS;

public class Tag : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ICollection<Article> Articles { get; set; } = new List<Article>();
    public ICollection<ArticleTag> ArticleTags { get; set; } = new List<ArticleTag>();
}
