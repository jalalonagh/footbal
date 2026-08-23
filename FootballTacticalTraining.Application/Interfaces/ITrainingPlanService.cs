using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Application.Interfaces;

public interface ITrainingPlanService
{
    Task<TrainingPlan?> GetByIdAsync(Guid id);
    Task<List<TrainingPlan>> GetByPlayerAsync(Guid playerId);
    Task<List<TrainingPlan>> GetByTeamAsync(Guid teamId);
    Task<List<TrainingPlan>> GetByCoachAsync(Guid coachId);
    Task<TrainingPlan> CreateAsync(TrainingPlan plan);
    Task<TrainingPlan> UpdateAsync(TrainingPlan plan);
    Task DeleteAsync(Guid id);
    Task<TrainingPlanItem> AddItemAsync(Guid planId, TrainingPlanItem item);
    Task<TrainingPlanItem> UpdateItemAsync(TrainingPlanItem item);
    Task DeleteItemAsync(Guid planId, Guid itemId);
    Task CompleteItemAsync(Guid planId, Guid itemId);
}
