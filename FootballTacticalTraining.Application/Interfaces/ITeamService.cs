using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Application.Interfaces;

public interface ITeamService
{
    Task<Team?> GetByIdAsync(Guid id);
    Task<List<Team>> GetAllAsync(int page = 1, int pageSize = 20);
    Task<List<Team>> GetByCoachAsync(Guid coachId);
    Task<Team> CreateAsync(Team team);
    Task<Team> UpdateAsync(Team team);
    Task DeleteAsync(Guid id);
    Task AddPlayerAsync(Guid teamId, Guid playerProfileId, string position, int shirtNumber);
    Task RemovePlayerAsync(Guid teamId, Guid playerProfileId);
    Task<List<TeamPlayer>> GetRosterAsync(Guid teamId);
    Task UpdatePlayerRoleAsync(Guid teamId, Guid playerProfileId, string position, int shirtNumber);
}
