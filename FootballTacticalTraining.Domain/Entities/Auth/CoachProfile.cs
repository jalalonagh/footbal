namespace FootballTacticalTraining.Domain.Entities.Auth;

public class CoachProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string? License { get; set; }
    public string? Experience { get; set; }
    public string? Specialization { get; set; }
    public ICollection<Team> Teams { get; set; } = new List<Team>();
}
