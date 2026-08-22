using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Domain.Entities;

public class PlayerProgress : BaseEntity
{
    public Guid PlayerProfileId { get; set; }
    public PlayerProfile PlayerProfile { get; set; } = null!;
    public string SkillCategory { get; set; } = string.Empty;
    public decimal CurrentScore { get; set; }
    public decimal PreviousScore { get; set; }
    public decimal Improvement { get; set; }
    public int SessionsCompleted { get; set; }
    public int TotalAttempts { get; set; }
    public DateTime LastPracticedAt { get; set; }
    public string? DetailsJson { get; set; }
}
