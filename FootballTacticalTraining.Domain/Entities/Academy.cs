using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Domain.Entities;

public class Academy : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Province { get; set; }
    public string? Country { get; set; } = "Iran";
    public string? Website { get; set; }
    public string? Instagram { get; set; }
    public string? Telegram { get; set; }
    public int? FoundedYear { get; set; }
    public string? AgeGroups { get; set; }
    public string? PlayingStyle { get; set; }
    public string? Facilities { get; set; }
    public int? MinAge { get; set; }
    public int? MaxAge { get; set; }
    public decimal? MonthlyFee { get; set; }
    public bool IsActive { get; set; } = true;
    public AcademyStatus Status { get; set; } = AcademyStatus.Draft;
    public string? AdminNotes { get; set; }
    public string? RejectionReason { get; set; }
    public Guid? CreatedById { get; set; }

    public ICollection<Team> Teams { get; set; } = new List<Team>();
    public ICollection<User> Users { get; set; } = new List<User>();
}
