using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Domain.Entities;

public class UserPosition : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid PositionId { get; set; }
    public DateTime SelectedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    public User User { get; set; } = null!;
    public Position Position { get; set; } = null!;
}
