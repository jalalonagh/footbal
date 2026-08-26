using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Application.Interfaces;

public interface IPositionVideoService
{
    Task<List<PositionVideo>> GetByPositionIdAsync(Guid positionId);
    Task<PositionVideo?> GetByIdAsync(Guid id);
    Task<PositionVideo> CreateAsync(PositionVideo video);
    Task<PositionVideo> UpdateAsync(PositionVideo video);
    Task<bool> DeleteAsync(Guid id);
}
