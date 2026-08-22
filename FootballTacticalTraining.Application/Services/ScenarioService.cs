using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FootballTacticalTraining.Application.Services;

public class ScenarioService : IScenarioService
{
    private readonly IUnitOfWork _unitOfWork;

    public ScenarioService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Scenario?> GetByIdAsync(Guid id)
    {
        return await _unitOfWork.Repository<Scenario>().GetByIdAsync(id);
    }

    public async Task<List<Scenario>> GetByCategoryAsync(ScenarioCategory category)
    {
        var scenarios = await _unitOfWork.Repository<Scenario>().FindAsync(s => s.Category == category && s.Status == ScenarioState.Published && s.IsPublic);
        return scenarios.ToList();
    }

    public async Task<List<Scenario>> GetByDifficultyAsync(DifficultyLevel difficulty)
    {
        var scenarios = await _unitOfWork.Repository<Scenario>().FindAsync(s => s.Difficulty == difficulty && s.Status == ScenarioState.Published && s.IsPublic);
        return scenarios.ToList();
    }

    public async Task<List<Scenario>> GetPublicScenariosAsync(int page, int pageSize)
    {
        var allScenarios = await _unitOfWork.Repository<Scenario>().FindAsync(s => s.Status == ScenarioState.Published && s.IsPublic);
        return allScenarios.Skip((page - 1) * pageSize).Take(pageSize).ToList();
    }

    public async Task<List<Scenario>> SearchAsync(string query)
    {
        var scenarios = await _unitOfWork.Repository<Scenario>().FindAsync(s => 
            s.Name.Contains(query) || s.Description.Contains(query));
        return scenarios.ToList();
    }

    public async Task<Scenario> CreateAsync(Scenario scenario)
    {
        scenario.Id = Guid.NewGuid();
        scenario.CreatedAt = DateTime.UtcNow;
        scenario.Status = ScenarioState.Draft;
        await _unitOfWork.Repository<Scenario>().AddAsync(scenario);
        await _unitOfWork.SaveChangesAsync();
        return scenario;
    }

    public async Task UpdateAsync(Scenario scenario)
    {
        scenario.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<Scenario>().UpdateAsync(scenario);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var scenario = await _unitOfWork.Repository<Scenario>().GetByIdAsync(id);
        if (scenario != null)
        {
            scenario.IsDeleted = true;
            scenario.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<Scenario>().UpdateAsync(scenario);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _unitOfWork.Repository<Scenario>().CountAsync(s => s.Status == ScenarioState.Published);
    }
}
