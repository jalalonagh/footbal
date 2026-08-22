namespace FootballTacticalTraining.Domain.Entities.CMS;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Slug { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public Category? Parent { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<Article> Articles { get; set; } = new List<Article>();
    public ICollection<Category> Children { get; set; } = new List<Category>();
}
