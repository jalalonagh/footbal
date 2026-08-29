using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Application.Interfaces;

public interface IAcademyService
{
    Task<Academy?> GetByIdAsync(Guid id);
    Task<List<Academy>> GetApprovedAcademiesAsync(int page = 1, int pageSize = 20, string? search = null, string? city = null, string? province = null);
    Task<int> GetApprovedCountAsync(string? search = null, string? city = null, string? province = null);
    Task<List<Academy>> GetAllForAdminAsync(string? status, string? search, int page, int pageSize);
    Task<int> GetAdminCountAsync(string? status, string? search);
    Task<Academy> CreateAsync(Academy academy);
    Task<Academy> UpdateAsync(Academy academy);
    Task DeleteAsync(Guid id);
    Task<List<Team>> GetTeamsAsync(Guid academyId);
    Task AddTeamAsync(Guid academyId, Guid teamId);
    Task RemoveTeamAsync(Guid academyId, Guid teamId);
}
