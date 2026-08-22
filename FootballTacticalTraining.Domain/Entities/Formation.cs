using System.Text.Json;

namespace FootballTacticalTraining.Domain.Entities;

public class Formation : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string PositionsJson { get; set; } = "[]";
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    
    public Dictionary<string, object>? Positions => 
        string.IsNullOrEmpty(PositionsJson) ? null : 
        JsonSerializer.Deserialize<Dictionary<string, object>>(PositionsJson);
}