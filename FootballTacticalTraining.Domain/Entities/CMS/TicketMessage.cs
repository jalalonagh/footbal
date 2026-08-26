using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Domain.Entities.CMS;

public class TicketMessage : BaseEntity
{
    public Guid TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;
    public Guid SenderId { get; set; }
    public User Sender { get; set; } = null!;
    public string Message { get; set; } = null!;
    public bool IsFromAdmin { get; set; }
}
