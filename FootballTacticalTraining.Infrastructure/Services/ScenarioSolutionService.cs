using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Infrastructure.Services;

public class ScenarioSolutionService : IScenarioSolutionService
{
    private readonly IUnitOfWork _unitOfWork;
    public ScenarioSolutionService(IUnitOfWork unitOfWork) { _unitOfWork = unitOfWork; }

    public async Task<List<ScenarioSolution>> GetByScenarioAsync(Guid scenarioId)
    {
        var items = await _unitOfWork.Repository<ScenarioSolution>().FindAsync(s => s.ScenarioId == scenarioId);
        return items.ToList();
    }

    public async Task<ScenarioSolution?> GetByIdAsync(Guid id) => await _unitOfWork.Repository<ScenarioSolution>().GetByIdAsync(id);

    public async Task<ScenarioSolution> CreateAsync(ScenarioSolution solution)
    {
        await _unitOfWork.Repository<ScenarioSolution>().AddAsync(solution);
        await _unitOfWork.SaveChangesAsync();
        return solution;
    }

    public async Task<ScenarioSolution> UpdateAsync(ScenarioSolution solution)
    {
        await _unitOfWork.Repository<ScenarioSolution>().UpdateAsync(solution);
        await _unitOfWork.SaveChangesAsync();
        return solution;
    }

    public async Task DeleteAsync(Guid id)
    {
        var item = await _unitOfWork.Repository<ScenarioSolution>().GetByIdAsync(id);
        if (item != null) { await _unitOfWork.Repository<ScenarioSolution>().DeleteAsync(item); await _unitOfWork.SaveChangesAsync(); }
    }
}

public class ScenarioRuleService : IScenarioRuleService
{
    private readonly IUnitOfWork _unitOfWork;
    public ScenarioRuleService(IUnitOfWork unitOfWork) { _unitOfWork = unitOfWork; }

    public async Task<List<ScenarioRule>> GetByScenarioAsync(Guid scenarioId)
    {
        var items = await _unitOfWork.Repository<ScenarioRule>().FindAsync(r => r.ScenarioId == scenarioId);
        return items.ToList();
    }

    public async Task<ScenarioRule?> GetByIdAsync(Guid id) => await _unitOfWork.Repository<ScenarioRule>().GetByIdAsync(id);

    public async Task<ScenarioRule> CreateAsync(ScenarioRule rule)
    {
        await _unitOfWork.Repository<ScenarioRule>().AddAsync(rule);
        await _unitOfWork.SaveChangesAsync();
        return rule;
    }

    public async Task<ScenarioRule> UpdateAsync(ScenarioRule rule)
    {
        await _unitOfWork.Repository<ScenarioRule>().UpdateAsync(rule);
        await _unitOfWork.SaveChangesAsync();
        return rule;
    }

    public async Task DeleteAsync(Guid id)
    {
        var item = await _unitOfWork.Repository<ScenarioRule>().GetByIdAsync(id);
        if (item != null) { await _unitOfWork.Repository<ScenarioRule>().DeleteAsync(item); await _unitOfWork.SaveChangesAsync(); }
    }
}
