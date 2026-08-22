using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Domain.Entities;

public class PlayerSkill : BaseEntity
{
    public Guid PlayerProfileId { get; set; }
    public PlayerProfile PlayerProfile { get; set; } = null!;
    public string SkillName { get; set; } = string.Empty;
    public decimal Score { get; set; }
    public decimal MaxScore { get; set; } = 100;
    public string? Category { get; set; }
    public int PracticeCount { get; set; }
    public DateTime LastPracticedAt { get; set; }
}
