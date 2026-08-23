using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Application.Interfaces;

public interface IPlayerProgressService
{
    Task<PlayerProgress?> GetByPlayerAndCategoryAsync(Guid playerId, string skillCategory);
    Task<List<PlayerProgress>> GetByPlayerAsync(Guid playerId);
    Task<List<PlayerSkill>> GetSkillsAsync(Guid playerId);
    Task<PlayerSkill?> GetSkillAsync(Guid playerId, string skillName);
    Task UpdateAfterSessionAsync(Guid playerId, decimal overallScore, decimal positioningScore, decimal movementScore, decimal timingScore, decimal awarenessScore, decimal decisionScore);
    Task<PlayerProgress> UpsertProgressAsync(Guid playerId, string skillCategory, decimal newScore);
    Task<PlayerSkill> UpsertSkillAsync(Guid playerId, string skillName, decimal score, string category);
}
