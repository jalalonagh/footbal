using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Application.Interfaces;

public interface IScenarioSolutionService
{
    Task<List<ScenarioSolution>> GetByScenarioAsync(Guid scenarioId);
    Task<ScenarioSolution?> GetByIdAsync(Guid id);
    Task<ScenarioSolution> CreateAsync(ScenarioSolution solution);
    Task<ScenarioSolution> UpdateAsync(ScenarioSolution solution);
    Task DeleteAsync(Guid id);
}

public interface IScenarioRuleService
{
    Task<List<ScenarioRule>> GetByScenarioAsync(Guid scenarioId);
    Task<ScenarioRule?> GetByIdAsync(Guid id);
    Task<ScenarioRule> CreateAsync(ScenarioRule rule);
    Task<ScenarioRule> UpdateAsync(ScenarioRule rule);
    Task DeleteAsync(Guid id);
}
