using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Application.Interfaces;

public interface IPlayerProfileService
{
    Task<PlayerProfile?> GetByIdAsync(Guid id);
    Task<PlayerProfile?> GetByUserIdAsync(Guid userId);
    Task<List<PlayerProfile>> GetAllAsync(int page = 1, int pageSize = 20);
    Task<PlayerProfile> CreateAsync(PlayerProfile profile);
    Task<PlayerProfile> UpdateAsync(PlayerProfile profile);
    Task DeleteAsync(Guid id);
    Task<List<Achievement>> GetAchievementsAsync(Guid playerId);
    Task<UserAchievement> AwardAchievementAsync(Guid playerId, Guid achievementId, string? notes = null);
}
