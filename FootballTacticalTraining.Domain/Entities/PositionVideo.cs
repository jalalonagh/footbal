using System.Text.Json.Serialization;

namespace FootballTacticalTraining.Domain.Entities;

public class PositionVideo : BaseEntity
{
    public Guid PositionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? TitleFa { get; set; }
    public string? Description { get; set; }
    public string? DescriptionFa { get; set; }
    public string VideoUrl { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;

    [JsonIgnore]
    public Position? Position { get; set; }
}
