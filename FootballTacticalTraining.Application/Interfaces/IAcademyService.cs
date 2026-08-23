using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Application.Interfaces;

public interface IAcademyService
{
    Task<Academy?> GetByIdAsync(Guid id);
    Task<List<Academy>> GetAllAsync(int page = 1, int pageSize = 20);
    Task<Academy> CreateAsync(Academy academy);
    Task<Academy> UpdateAsync(Academy academy);
    Task DeleteAsync(Guid id);
    Task<List<Team>> GetTeamsAsync(Guid academyId);
    Task AddTeamAsync(Guid academyId, Guid teamId);
    Task RemoveTeamAsync(Guid academyId, Guid teamId);
}
