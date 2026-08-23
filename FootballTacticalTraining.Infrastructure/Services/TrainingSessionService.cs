using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Infrastructure.Data;

namespace FootballTacticalTraining.Infrastructure.Services;

public class TrainingSessionService : ITrainingSessionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEvaluationEngine _evaluationEngine;
    private readonly IPlayerProgressService _playerProgressService;

    public TrainingSessionService(IUnitOfWork unitOfWork, IEvaluationEngine evaluationEngine, IPlayerProgressService playerProgressService)
    {
        _unitOfWork = unitOfWork;
        _evaluationEngine = evaluationEngine;
        _playerProgressService = playerProgressService;
    }

    public async Task<TrainingSession?> GetByIdAsync(Guid id)
    {
        return await _unitOfWork.Repository<TrainingSession>().GetByIdAsync(id);
    }

    public async Task<List<TrainingSession>> GetByPlayerAsync(Guid playerId, int page = 1, int pageSize = 20)
    {
        var sessions = await _unitOfWork.Repository<TrainingSession>()
            .FindAsync(s => s.PlayerProfileId == playerId && !s.IsDeleted);
        return sessions
            .OrderByDescending(s => s.StartedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }

    public async Task<List<TrainingSession>> GetByTeamAsync(Guid teamId, int page = 1, int pageSize = 20)
    {
        var sessions = await _unitOfWork.Repository<TrainingSession>()
            .FindAsync(s => s.TeamId == teamId && !s.IsDeleted);
        return sessions
            .OrderByDescending(s => s.StartedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }

    public async Task<TrainingSession> StartSessionAsync(Guid playerId, Guid scenarioId, TrainingMode mode, Guid? teamId = null)
    {
        var session = new TrainingSession
        {
            PlayerProfileId = playerId,
            ScenarioId = scenarioId,
            TeamId = teamId,
            Mode = mode,
            StartedAt = DateTime.UtcNow,
            IsCompleted = false
        };

        await _unitOfWork.Repository<TrainingSession>().AddAsync(session);
        await _unitOfWork.SaveChangesAsync();
        return session;
    }

    public async Task<Decision> RecordDecisionAsync(Guid sessionId, string actionType, decimal userX, decimal userY, decimal userTiming, decimal optimalX, decimal optimalY, decimal optimalTiming, string? actionData = null)
    {
        var input = new DecisionInput
        {
            UserX = userX,
            UserY = userY,
            OptimalX = optimalX,
            OptimalY = optimalY,
            UserTiming = userTiming,
            OptimalTiming = optimalTiming,
            ActionType = actionType
        };

        var evaluation = await _evaluationEngine.EvaluateDecisionAsync(input);

        var session = await _unitOfWork.Repository<TrainingSession>().GetByIdAsync(sessionId);
        var order = (session?.Decisions?.Count ?? 0) + 1;

        var decision = new Decision
        {
            TrainingSessionId = sessionId,
            ActionType = Enum.TryParse<TacticalActionType>(actionType, true, out var at) ? at : TacticalActionType.HOLD_POSITION,
            UserX = userX,
            UserY = userY,
            OptimalX = optimalX,
            OptimalY = optimalY,
            Score = evaluation.OverallScore,
            Timing = userTiming,
            IsCorrect = evaluation.OverallScore >= 60,
            MistakeType = Enum.TryParse<MistakeType>(evaluation.MistakeType, true, out var mt) ? mt : (MistakeType?)null,
            Explanation = evaluation.Explanation,
            Order = order,
            DecidedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<Decision>().AddAsync(decision);

        if (session != null)
        {
            session.TotalDecisions++;
            if (decision.IsCorrect) session.CorrectDecisions++;
            else session.WrongDecisions++;
            await _unitOfWork.Repository<TrainingSession>().UpdateAsync(session);
        }

        await _unitOfWork.SaveChangesAsync();
        return decision;
    }

    public async Task<TrainingSession> CompleteSessionAsync(Guid sessionId)
    {
        var session = await _unitOfWork.Repository<TrainingSession>().GetByIdAsync(sessionId)
            ?? throw new InvalidOperationException("Session not found");

        session.CompletedAt = DateTime.UtcNow;
        session.IsCompleted = true;

        if (session.TotalDecisions > 0)
        {
            session.OverallScore = session.CorrectDecisions * 100m / session.TotalDecisions;
        }

        await _unitOfWork.Repository<TrainingSession>().UpdateAsync(session);

        var result = new TrainingResult
        {
            TrainingSessionId = sessionId,
            PlayerProfileId = session.PlayerProfileId,
            OverallScore = session.OverallScore,
            PositioningScore = session.OverallScore * 0.95m,
            MovementScore = session.OverallScore * 0.9m,
            TimingScore = session.OverallScore * 1.02m,
            AwarenessScore = session.OverallScore * 0.88m,
            DecisionScore = session.OverallScore,
            MistakeType = session.WrongDecisions > session.CorrectDecisions ? MistakeType.DECISION_ERROR : (MistakeType?)null,
            CompletedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<TrainingResult>().AddAsync(result);

        await _playerProgressService.UpdateAfterSessionAsync(
            session.PlayerProfileId,
            session.OverallScore,
            result.PositioningScore,
            result.MovementScore,
            result.TimingScore,
            result.AwarenessScore,
            result.DecisionScore);

        await _unitOfWork.SaveChangesAsync();
        return session;
    }

    public async Task<TrainingResult?> GetResultAsync(Guid sessionId)
    {
        var results = await _unitOfWork.Repository<TrainingResult>()
            .FindAsync(r => r.TrainingSessionId == sessionId);
        return results.FirstOrDefault();
    }

    public async Task<List<TrainingSession>> GetRecentSessionsAsync(Guid playerId, int count = 10)
    {
        var sessions = await _unitOfWork.Repository<TrainingSession>()
            .FindAsync(s => s.PlayerProfileId == playerId && s.IsCompleted && !s.IsDeleted);
        return sessions
            .OrderByDescending(s => s.CompletedAt)
            .Take(count)
            .ToList();
    }

    public async Task<int> GetTotalSessionsAsync(Guid playerId)
    {
        return await _unitOfWork.Repository<TrainingSession>()
            .CountAsync(s => s.PlayerProfileId == playerId && !s.IsDeleted);
    }
}
