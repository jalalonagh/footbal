using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Infrastructure.Services;

public class PlayerProgressService : IPlayerProgressService
{
    private readonly IUnitOfWork _unitOfWork;

    public PlayerProgressService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PlayerProgress?> GetByPlayerAndCategoryAsync(Guid playerId, string skillCategory)
    {
        var progresses = await _unitOfWork.Repository<PlayerProgress>()
            .FindAsync(p => p.PlayerProfileId == playerId && p.SkillCategory == skillCategory && !p.IsDeleted);
        return progresses.FirstOrDefault();
    }

    public async Task<List<PlayerProgress>> GetByPlayerAsync(Guid playerId)
    {
        var _list = await _unitOfWork.Repository<PlayerProgress>().FindAsync(p => p.PlayerProfileId == playerId && !p.IsDeleted); return _list.ToList();
    }

    public async Task<List<PlayerSkill>> GetSkillsAsync(Guid playerId)
    {
        var _list = await _unitOfWork.Repository<PlayerSkill>().FindAsync(s => s.PlayerProfileId == playerId && !s.IsDeleted); return _list.ToList();
    }

    public async Task<PlayerSkill?> GetSkillAsync(Guid playerId, string skillName)
    {
        var skills = await _unitOfWork.Repository<PlayerSkill>()
            .FindAsync(s => s.PlayerProfileId == playerId && s.SkillName == skillName && !s.IsDeleted);
        return skills.FirstOrDefault();
    }

    public async Task UpdateAfterSessionAsync(Guid playerId, decimal overallScore, decimal positioningScore, decimal movementScore, decimal timingScore, decimal awarenessScore, decimal decisionScore)
    {
        await UpsertProgressAsync(playerId, "Positioning", positioningScore);
        await UpsertProgressAsync(playerId, "Movement", movementScore);
        await UpsertProgressAsync(playerId, "Timing", timingScore);
        await UpsertProgressAsync(playerId, "Awareness", awarenessScore);
        await UpsertProgressAsync(playerId, "Decision", decisionScore);
        await UpsertProgressAsync(playerId, "Overall", overallScore);
    }

    public async Task<PlayerProgress> UpsertProgressAsync(Guid playerId, string skillCategory, decimal newScore)
    {
        var existing = await GetByPlayerAndCategoryAsync(playerId, skillCategory);
        if (existing != null)
        {
            existing.PreviousScore = existing.CurrentScore;
            existing.CurrentScore = newScore;
            existing.Improvement = newScore - existing.PreviousScore;
            existing.SessionsCompleted++;
            existing.TotalAttempts++;
            existing.LastPracticedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<PlayerProgress>().UpdateAsync(existing);
            await _unitOfWork.SaveChangesAsync();
            return existing;
        }

        var progress = new PlayerProgress
        {
            PlayerProfileId = playerId,
            SkillCategory = skillCategory,
            CurrentScore = newScore,
            PreviousScore = 0,
            Improvement = newScore,
            SessionsCompleted = 1,
            TotalAttempts = 1,
            LastPracticedAt = DateTime.UtcNow
        };
        await _unitOfWork.Repository<PlayerProgress>().AddAsync(progress);
        await _unitOfWork.SaveChangesAsync();
        return progress;
    }

    public async Task<PlayerSkill> UpsertSkillAsync(Guid playerId, string skillName, decimal score, string category)
    {
        var existing = await GetSkillAsync(playerId, skillName);
        if (existing != null)
        {
            existing.Score = score;
            existing.PracticeCount++;
            existing.LastPracticedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<PlayerSkill>().UpdateAsync(existing);
            await _unitOfWork.SaveChangesAsync();
            return existing;
        }

        var skill = new PlayerSkill
        {
            PlayerProfileId = playerId,
            SkillName = skillName,
            Score = score,
            MaxScore = 100,
            Category = category,
            PracticeCount = 1,
            LastPracticedAt = DateTime.UtcNow
        };
        await _unitOfWork.Repository<PlayerSkill>().AddAsync(skill);
        await _unitOfWork.SaveChangesAsync();
        return skill;
    }
}

