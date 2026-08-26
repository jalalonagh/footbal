using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Domain.Entities.Auth;

public class UserDevice : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string DeviceInfo { get; set; } = null!;
    public string? IpAddress { get; set; }
    public DateTime LastActiveAt { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
