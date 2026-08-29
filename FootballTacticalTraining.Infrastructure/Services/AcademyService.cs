using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Enums;
using Microsoft.EntityFrameworkCore;

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

    public async Task<List<Academy>> GetApprovedAcademiesAsync(int page = 1, int pageSize = 20, string? search = null, string? city = null, string? province = null)
    {
        var db = _unitOfWork.Repository<Academy>().GetDbContext();
        var query = db.Set<Academy>()
            .Where(a => !a.IsDeleted && a.Status == AcademyStatus.Approved && a.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(a => a.Name.Contains(search) || (a.Description != null && a.Description.Contains(search)) || (a.City != null && a.City.Contains(search)));

        if (!string.IsNullOrWhiteSpace(city))
            query = query.Where(a => a.City == city);

        if (!string.IsNullOrWhiteSpace(province))
            query = query.Where(a => a.Province == province);

        return await query.OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetApprovedCountAsync(string? search = null, string? city = null, string? province = null)
    {
        var db = _unitOfWork.Repository<Academy>().GetDbContext();
        var query = db.Set<Academy>()
            .Where(a => !a.IsDeleted && a.Status == AcademyStatus.Approved && a.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(a => a.Name.Contains(search) || (a.Description != null && a.Description.Contains(search)) || (a.City != null && a.City.Contains(search)));

        if (!string.IsNullOrWhiteSpace(city))
            query = query.Where(a => a.City == city);

        if (!string.IsNullOrWhiteSpace(province))
            query = query.Where(a => a.Province == province);

        return await query.CountAsync();
    }

    public async Task<List<Academy>> GetAllForAdminAsync(string? status, string? search, int page, int pageSize)
    {
        var db = _unitOfWork.Repository<Academy>().GetDbContext();
        var query = db.Set<Academy>().Where(a => !a.IsDeleted).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<AcademyStatus>(status, true, out var state))
            query = query.Where(a => a.Status == state);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(a => a.Name.Contains(search) || (a.City != null && a.City.Contains(search)));

        return await query.OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetAdminCountAsync(string? status, string? search)
    {
        var db = _unitOfWork.Repository<Academy>().GetDbContext();
        var query = db.Set<Academy>().Where(a => !a.IsDeleted).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<AcademyStatus>(status, true, out var state))
            query = query.Where(a => a.Status == state);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(a => a.Name.Contains(search) || (a.City != null && a.City.Contains(search)));

        return await query.CountAsync();
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
