using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities.Subscriptions;
using Microsoft.EntityFrameworkCore;

namespace FootballTacticalTraining.Application.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly IUnitOfWork _unitOfWork;

    public SubscriptionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> HasFeatureAccessAsync(Guid userId, string featureKey)
    {
        var entitlements = await _unitOfWork.Repository<UserEntitlement>()
            .FindAsync(e => e.UserId == userId && e.Feature.Key == featureKey);
        
        return entitlements.Any(e => 
            (!e.ExpiresAt.HasValue || e.ExpiresAt > DateTime.UtcNow) &&
            (!e.RemainingUsage.HasValue || e.RemainingUsage > 0));
    }

    public async Task<int?> GetRemainingUsageAsync(Guid userId, string featureKey)
    {
        var entitlements = await _unitOfWork.Repository<UserEntitlement>()
            .FindAsync(e => e.UserId == userId && e.Feature.Key == featureKey);
        
        var active = entitlements.FirstOrDefault(e => 
            (!e.ExpiresAt.HasValue || e.ExpiresAt > DateTime.UtcNow));
        
        return active?.RemainingUsage;
    }

    public async Task<Subscription?> GetActiveSubscriptionAsync(Guid userId)
    {
        var subscriptions = await _unitOfWork.Repository<Subscription>()
            .FindAsync(s => s.UserId == userId && s.Status == Domain.Enums.SubscriptionStatus.Active);
        
        return subscriptions.OrderByDescending(s => s.EndDate).FirstOrDefault();
    }

    public async Task<bool> IsSubscriptionActiveAsync(Guid userId)
    {
        var subscription = await GetActiveSubscriptionAsync(userId);
        return subscription != null && subscription.EndDate > DateTime.UtcNow;
    }

    public async Task DeactivateExpiredSubscriptionsAsync()
    {
        var expired = await _unitOfWork.Repository<Subscription>()
            .FindAsync(s => s.Status == Domain.Enums.SubscriptionStatus.Active && s.EndDate <= DateTime.UtcNow);
        
        foreach (var sub in expired)
        {
            sub.Status = Domain.Enums.SubscriptionStatus.Expired;
            sub.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<Subscription>().UpdateAsync(sub);
        }
        await _unitOfWork.SaveChangesAsync();
    }
}