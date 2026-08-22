using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Domain.Entities.Subscriptions;

public class PaymentTransaction : BaseEntity
{
    public Guid PaymentId { get; set; }
    public Payment Payment { get; set; } = null!;
    public string TransactionType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; }
    public string? ResponseJson { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime TransactionDate { get; set; }
}
