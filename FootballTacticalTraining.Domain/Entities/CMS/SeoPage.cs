using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Domain.Entities.CMS;

public class SeoPage : BaseEntity
{
    public string Url { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? MetaDescription { get; set; }
    public string? Slug { get; set; }
    public string? Canonical { get; set; }
    public string? H1 { get; set; }
    public string? OgTitle { get; set; }
    public string? OgDescription { get; set; }
    public string? OgImage { get; set; }
    public string? Keywords { get; set; }
    public string? SchemaJson { get; set; }
    public Language Language { get; set; } = Language.English;

    public Guid? ScenarioId { get; set; }
    public Scenario? Scenario { get; set; }

    public Guid? ArticleId { get; set; }
    public Article? Article { get; set; }

    public bool IsActive { get; set; } = true;
}
