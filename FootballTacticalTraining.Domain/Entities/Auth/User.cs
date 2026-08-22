using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Domain.Entities.Subscriptions;

namespace FootballTacticalTraining.Domain.Entities.Auth;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; } = UserRole.Guest;
    public bool IsActive { get; set; } = true;
    public bool EmailConfirmed { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public string? PreferredLanguage { get; set; } = "en";

    public PlayerProfile? PlayerProfile { get; set; }
    public CoachProfile? CoachProfile { get; set; }
    public ICollection<UserEntitlement> Entitlements { get; set; } = new List<UserEntitlement>();
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
