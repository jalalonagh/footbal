namespace FootballTacticalTraining.Domain.Entities.CMS;

public class ArticleTag : BaseEntity
{
    public Guid ArticleId { get; set; }
    public Article Article { get; set; } = null!;

    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}
