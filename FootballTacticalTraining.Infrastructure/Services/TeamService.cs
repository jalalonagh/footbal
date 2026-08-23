using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Infrastructure.Services;

public class TeamService : ITeamService
{
    private readonly IUnitOfWork _unitOfWork;

    public TeamService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Team?> GetByIdAsync(Guid id)
    {
        return await _unitOfWork.Repository<Team>().GetByIdAsync(id);
    }

    public async Task<List<Team>> GetAllAsync(int page = 1, int pageSize = 20)
    {
        var all = await _unitOfWork.Repository<Team>().FindAsync(t => !t.IsDeleted);
        return all.Skip((page - 1) * pageSize).Take(pageSize).ToList();
    }

    public async Task<List<Team>> GetByCoachAsync(Guid coachId)
    {
        var _list = await _unitOfWork.Repository<Team>().FindAsync(t => t.CoachProfileId == coachId && !t.IsDeleted); return _list.ToList();
    }

    public async Task<Team> CreateAsync(Team team)
    {
        await _unitOfWork.Repository<Team>().AddAsync(team);
        await _unitOfWork.SaveChangesAsync();
        return team;
    }

    public async Task<Team> UpdateAsync(Team team)
    {
        await _unitOfWork.Repository<Team>().UpdateAsync(team);
        await _unitOfWork.SaveChangesAsync();
        return team;
    }

    public async Task DeleteAsync(Guid id)
    {
        var team = await _unitOfWork.Repository<Team>().GetByIdAsync(id);
        if (team != null)
        {
            team.IsDeleted = true;
            await _unitOfWork.Repository<Team>().UpdateAsync(team);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task AddPlayerAsync(Guid teamId, Guid playerProfileId, string position, int shirtNumber)
    {
        var existing = await _unitOfWork.Repository<TeamPlayer>()
            .FindAsync(tp => tp.TeamId == teamId && tp.PlayerProfileId == playerProfileId);
        if (existing.Any()) return;

        var tp = new TeamPlayer
        {
            TeamId = teamId,
            PlayerProfileId = playerProfileId,
            Position = position,
            ShirtNumber = shirtNumber
        };
        await _unitOfWork.Repository<TeamPlayer>().AddAsync(tp);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task RemovePlayerAsync(Guid teamId, Guid playerProfileId)
    {
        var players = await _unitOfWork.Repository<TeamPlayer>()
            .FindAsync(tp => tp.TeamId == teamId && tp.PlayerProfileId == playerProfileId);
        var tp = players.FirstOrDefault();
        if (tp != null)
        {
            await _unitOfWork.Repository<TeamPlayer>().DeleteAsync(tp);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task<List<TeamPlayer>> GetRosterAsync(Guid teamId)
    {
        var _list = await _unitOfWork.Repository<TeamPlayer>().FindAsync(tp => tp.TeamId == teamId); return _list.ToList();
    }

    public async Task UpdatePlayerRoleAsync(Guid teamId, Guid playerProfileId, string position, int shirtNumber)
    {
        var players = await _unitOfWork.Repository<TeamPlayer>()
            .FindAsync(tp => tp.TeamId == teamId && tp.PlayerProfileId == playerProfileId);
        var tp = players.FirstOrDefault();
        if (tp != null)
        {
            tp.Position = position;
            tp.ShirtNumber = shirtNumber;
            await _unitOfWork.Repository<TeamPlayer>().UpdateAsync(tp);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}

