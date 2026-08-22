namespace FootballTacticalTraining.Application.DTOs.Subscription;

public record CreatePaymentDto(Guid PlanId, string CallbackUrl);