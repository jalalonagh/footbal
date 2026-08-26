using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Domain.Entities.CMS;

public class Ticket : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string Status { get; set; } = "Open";
    public string Priority { get; set; } = "Normal";
    public ICollection<TicketMessage> Messages { get; set; } = new List<TicketMessage>();
}
