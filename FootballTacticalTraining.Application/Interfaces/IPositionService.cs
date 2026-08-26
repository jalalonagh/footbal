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
    Task<MyPositionResponse?> GetMyPositionAsync(Guid userId);
    Task<UserPosition> SelectPositionAsync(Guid userId, Guid positionId);
    Task<bool> RemoveUserPositionAsync(Guid userId);
    Task<List<UserPosition>> GetAllUserPositionsAsync();
}

public class MyPositionResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid PositionId { get; set; }
    public DateTime SelectedAt { get; set; }
    public PositionDto Position { get; set; } = null!;
}

public class PositionDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameFa { get; set; }
    public string? Description { get; set; }
    public string? DescriptionFa { get; set; }
    public string? Requirements { get; set; }
    public string? RequirementsFa { get; set; }
    public string? IconUrl { get; set; }
    public string? Category { get; set; }
}
