using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Application.Interfaces;

public interface IScenarioPlayerService
{
    Task<List<ScenarioPlayer>> GetByScenarioAsync(Guid scenarioId);
    Task<ScenarioPlayer?> GetByIdAsync(Guid id);
    Task<ScenarioPlayer> CreateAsync(ScenarioPlayer player);
    Task<ScenarioPlayer> UpdateAsync(ScenarioPlayer player);
    Task DeleteAsync(Guid id);
    Task BulkCreateAsync(Guid scenarioId, List<ScenarioPlayer> players);
}
