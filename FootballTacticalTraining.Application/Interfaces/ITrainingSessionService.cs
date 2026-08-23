using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Enums;

namespace FootballTacticalTraining.Application.Interfaces;

public interface ITrainingSessionService
{
    Task<TrainingSession?> GetByIdAsync(Guid id);
    Task<List<TrainingSession>> GetByPlayerAsync(Guid playerId, int page = 1, int pageSize = 20);
    Task<List<TrainingSession>> GetByTeamAsync(Guid teamId, int page = 1, int pageSize = 20);
    Task<TrainingSession> StartSessionAsync(Guid playerId, Guid scenarioId, TrainingMode mode, Guid? teamId = null);
    Task<Decision> RecordDecisionAsync(Guid sessionId, string actionType, decimal userX, decimal userY, decimal userTiming, decimal optimalX, decimal optimalY, decimal optimalTiming, string? actionData = null);
    Task<TrainingSession> CompleteSessionAsync(Guid sessionId);
    Task<TrainingResult?> GetResultAsync(Guid sessionId);
    Task<List<TrainingSession>> GetRecentSessionsAsync(Guid playerId, int count = 10);
    Task<int> GetTotalSessionsAsync(Guid playerId);
}
