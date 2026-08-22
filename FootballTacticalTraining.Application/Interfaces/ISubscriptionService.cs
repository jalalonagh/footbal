using FootballTacticalTraining.Domain.Entities.Subscriptions;

namespace FootballTacticalTraining.Application.Interfaces;

public interface ISubscriptionService
{
    Task<bool> HasFeatureAccessAsync(Guid userId, string featureKey);
    Task<int?> GetRemainingUsageAsync(Guid userId, string featureKey);
    Task<Subscription?> GetActiveSubscriptionAsync(Guid userId);
    Task<bool> IsSubscriptionActiveAsync(Guid userId);
    Task DeactivateExpiredSubscriptionsAsync();
}
