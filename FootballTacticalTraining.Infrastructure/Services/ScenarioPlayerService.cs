using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Infrastructure.Services;

public class ScenarioPlayerService : IScenarioPlayerService
{
    private readonly IUnitOfWork _unitOfWork;

    public ScenarioPlayerService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<ScenarioPlayer>> GetByScenarioAsync(Guid scenarioId)
    {
        var players = await _unitOfWork.Repository<ScenarioPlayer>()
            .FindAsync(p => p.ScenarioId == scenarioId);
        return players.ToList();
    }

    public async Task<ScenarioPlayer?> GetByIdAsync(Guid id)
    {
        return await _unitOfWork.Repository<ScenarioPlayer>().GetByIdAsync(id);
    }

    public async Task<ScenarioPlayer> CreateAsync(ScenarioPlayer player)
    {
        await _unitOfWork.Repository<ScenarioPlayer>().AddAsync(player);
        await _unitOfWork.SaveChangesAsync();
        return player;
    }

    public async Task<ScenarioPlayer> UpdateAsync(ScenarioPlayer player)
    {
        await _unitOfWork.Repository<ScenarioPlayer>().UpdateAsync(player);
        await _unitOfWork.SaveChangesAsync();
        return player;
    }

    public async Task DeleteAsync(Guid id)
    {
        var player = await _unitOfWork.Repository<ScenarioPlayer>().GetByIdAsync(id);
        if (player != null)
        {
            await _unitOfWork.Repository<ScenarioPlayer>().DeleteAsync(player);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task BulkCreateAsync(Guid scenarioId, List<ScenarioPlayer> players)
    {
        foreach (var player in players)
        {
            player.ScenarioId = scenarioId;
            await _unitOfWork.Repository<ScenarioPlayer>().AddAsync(player);
        }
        await _unitOfWork.SaveChangesAsync();
    }
}
