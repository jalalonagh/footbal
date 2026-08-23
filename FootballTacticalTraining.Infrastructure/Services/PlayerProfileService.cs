using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities.Auth;
using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Infrastructure.Services;

public class PlayerProfileService : IPlayerProfileService
{
    private readonly IUnitOfWork _unitOfWork;

    public PlayerProfileService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PlayerProfile?> GetByIdAsync(Guid id)
    {
        return await _unitOfWork.Repository<PlayerProfile>().GetByIdAsync(id);
    }

    public async Task<PlayerProfile?> GetByUserIdAsync(Guid userId)
    {
        var profiles = await _unitOfWork.Repository<PlayerProfile>()
            .FindAsync(p => p.UserId == userId && !p.IsDeleted);
        return profiles.FirstOrDefault();
    }

    public async Task<List<PlayerProfile>> GetAllAsync(int page = 1, int pageSize = 20)
    {
        var all = await _unitOfWork.Repository<PlayerProfile>()
            .FindAsync(p => !p.IsDeleted);
        return all.Skip((page - 1) * pageSize).Take(pageSize).ToList();
    }

    public async Task<PlayerProfile> CreateAsync(PlayerProfile profile)
    {
        await _unitOfWork.Repository<PlayerProfile>().AddAsync(profile);
        await _unitOfWork.SaveChangesAsync();
        return profile;
    }

    public async Task<PlayerProfile> UpdateAsync(PlayerProfile profile)
    {
        await _unitOfWork.Repository<PlayerProfile>().UpdateAsync(profile);
        await _unitOfWork.SaveChangesAsync();
        return profile;
    }

    public async Task DeleteAsync(Guid id)
    {
        var profile = await _unitOfWork.Repository<PlayerProfile>().GetByIdAsync(id);
        if (profile != null)
        {
            profile.IsDeleted = true;
            await _unitOfWork.Repository<PlayerProfile>().UpdateAsync(profile);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task<List<Achievement>> GetAchievementsAsync(Guid playerId)
    {
        var userAchievements = await _unitOfWork.Repository<UserAchievement>()
            .FindAsync(ua => ua.UserId == playerId && !ua.IsDeleted);
        var achievementIds = userAchievements.Select(ua => ua.AchievementId).ToList();
        var achievements = await _unitOfWork.Repository<Achievement>()
            .FindAsync(a => achievementIds.Contains(a.Id) && !a.IsDeleted);
        return achievements.ToList();
    }

    public async Task<UserAchievement> AwardAchievementAsync(Guid playerId, Guid achievementId, string? notes = null)
    {
        var existing = await _unitOfWork.Repository<UserAchievement>()
            .FindAsync(ua => ua.UserId == playerId && ua.AchievementId == achievementId);
        if (existing.Any())
            return existing.First();

        var ua = new UserAchievement
        {
            UserId = playerId,
            AchievementId = achievementId,
            EarnedAt = DateTime.UtcNow
        };
        await _unitOfWork.Repository<UserAchievement>().AddAsync(ua);
        await _unitOfWork.SaveChangesAsync();
        return ua;
    }
}

