using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Infrastructure.Services;

public class AcademyService : IAcademyService
{
    private readonly IUnitOfWork _unitOfWork;

    public AcademyService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Academy?> GetByIdAsync(Guid id)
    {
        return await _unitOfWork.Repository<Academy>().GetByIdAsync(id);
    }

    public async Task<List<Academy>> GetAllAsync(int page = 1, int pageSize = 20)
    {
        var all = await _unitOfWork.Repository<Academy>().FindAsync(a => !a.IsDeleted);
        return all.Skip((page - 1) * pageSize).Take(pageSize).ToList();
    }

    public async Task<Academy> CreateAsync(Academy academy)
    {
        await _unitOfWork.Repository<Academy>().AddAsync(academy);
        await _unitOfWork.SaveChangesAsync();
        return academy;
    }

    public async Task<Academy> UpdateAsync(Academy academy)
    {
        await _unitOfWork.Repository<Academy>().UpdateAsync(academy);
        await _unitOfWork.SaveChangesAsync();
        return academy;
    }

    public async Task DeleteAsync(Guid id)
    {
        var academy = await _unitOfWork.Repository<Academy>().GetByIdAsync(id);
        if (academy != null)
        {
            academy.IsDeleted = true;
            await _unitOfWork.Repository<Academy>().UpdateAsync(academy);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task<List<Team>> GetTeamsAsync(Guid academyId)
    {
        var teams = await _unitOfWork.Repository<Team>()
            .FindAsync(t => t.AcademyId == academyId && !t.IsDeleted);
        return teams.ToList();
    }

    public async Task AddTeamAsync(Guid academyId, Guid teamId)
    {
        var team = await _unitOfWork.Repository<Team>().GetByIdAsync(teamId);
        if (team != null && team.AcademyId == academyId) return;
        if (team != null)
        {
            team.AcademyId = academyId;
            await _unitOfWork.Repository<Team>().UpdateAsync(team);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task RemoveTeamAsync(Guid academyId, Guid teamId)
    {
        var team = await _unitOfWork.Repository<Team>().GetByIdAsync(teamId);
        if (team != null && team.AcademyId == academyId)
        {
            team.AcademyId = null;
            await _unitOfWork.Repository<Team>().UpdateAsync(team);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}

