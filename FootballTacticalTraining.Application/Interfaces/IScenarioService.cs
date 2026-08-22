using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Application.Interfaces;

public interface IScenarioService
{
    Task<Scenario?> GetByIdAsync(Guid id);
    Task<List<Scenario>> GetByCategoryAsync(ScenarioCategory category);
    Task<List<Scenario>> GetByDifficultyAsync(DifficultyLevel difficulty);
    Task<List<Scenario>> GetPublicScenariosAsync(int page, int pageSize);
    Task<List<Scenario>> SearchAsync(string query);
    Task<Scenario> CreateAsync(Scenario scenario);
    Task UpdateAsync(Scenario scenario);
    Task DeleteAsync(Guid id);
    Task<int> GetTotalCountAsync();
}
