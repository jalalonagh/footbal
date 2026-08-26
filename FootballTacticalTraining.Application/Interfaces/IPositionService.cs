using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Application.Interfaces;

public interface IPositionService
{
    Task<List<Position>> GetAllPositionsAsync(bool includeInactive = false);
    Task<Position?> GetPositionByIdAsync(Guid id);
    Task<Position> CreatePositionAsync(Position position);
    Task<Position> UpdatePositionAsync(Position position);
    Task<bool> DeletePositionAsync(Guid id);
    Task<UserPosition?> GetUserPositionAsync(Guid userId);
    Task<UserPosition> SelectPositionAsync(Guid userId, Guid positionId);
    Task<bool> RemoveUserPositionAsync(Guid userId);
    Task<List<UserPosition>> GetAllUserPositionsAsync();
}
