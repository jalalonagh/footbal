namespace FootballTacticalTraining.Domain.Entities;

public class AiLog : BaseEntity
{
    public Guid? UserId { get; set; }
    public string Endpoint { get; set; } = string.Empty;
    public string RequestBody { get; set; } = string.Empty;
    public string ResponseBody { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public long DurationMs { get; set; }
    public string? ErrorMessage { get; set; }
    public string? Model { get; set; }
    public int? TokensUsed { get; set; }
}
