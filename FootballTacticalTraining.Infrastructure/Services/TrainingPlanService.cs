using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Infrastructure.Services;

public class TrainingPlanService : ITrainingPlanService
{
    private readonly IUnitOfWork _unitOfWork;

    public TrainingPlanService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TrainingPlan?> GetByIdAsync(Guid id)
    {
        return await _unitOfWork.Repository<TrainingPlan>().GetByIdAsync(id);
    }

    public async Task<List<TrainingPlan>> GetByPlayerAsync(Guid playerId)
    {
        var _list = await _unitOfWork.Repository<TrainingPlan>().FindAsync(p => p.PlayerProfileId == playerId && p.IsActive && !p.IsDeleted); return _list.ToList();
    }

    public async Task<List<TrainingPlan>> GetByTeamAsync(Guid teamId)
    {
        var _list = await _unitOfWork.Repository<TrainingPlan>().FindAsync(p => p.TeamId == teamId && p.IsActive && !p.IsDeleted); return _list.ToList();
    }

    public async Task<List<TrainingPlan>> GetByCoachAsync(Guid coachId)
    {
        var _list = await _unitOfWork.Repository<TrainingPlan>().FindAsync(p => p.CreatedByCoachId == coachId && !p.IsDeleted); return _list.ToList();
    }

    public async Task<TrainingPlan> CreateAsync(TrainingPlan plan)
    {
        if (plan.StartDate == default) plan.StartDate = DateTime.UtcNow;
        plan.IsActive = true;
        await _unitOfWork.Repository<TrainingPlan>().AddAsync(plan);
        await _unitOfWork.SaveChangesAsync();
        return plan;
    }

    public async Task<TrainingPlan> UpdateAsync(TrainingPlan plan)
    {
        await _unitOfWork.Repository<TrainingPlan>().UpdateAsync(plan);
        await _unitOfWork.SaveChangesAsync();
        return plan;
    }

    public async Task DeleteAsync(Guid id)
    {
        var plan = await _unitOfWork.Repository<TrainingPlan>().GetByIdAsync(id);
        if (plan != null)
        {
            plan.IsDeleted = true;
            await _unitOfWork.Repository<TrainingPlan>().UpdateAsync(plan);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task<TrainingPlanItem> AddItemAsync(Guid planId, TrainingPlanItem item)
    {
        item.TrainingPlanId = planId;
        var items = await _unitOfWork.Repository<TrainingPlanItem>()
            .FindAsync(i => i.TrainingPlanId == planId);
        item.DisplayOrder = items.Count() + 1;
        await _unitOfWork.Repository<TrainingPlanItem>().AddAsync(item);
        await _unitOfWork.SaveChangesAsync();
        return item;
    }

    public async Task<TrainingPlanItem> UpdateItemAsync(TrainingPlanItem item)
    {
        await _unitOfWork.Repository<TrainingPlanItem>().UpdateAsync(item);
        await _unitOfWork.SaveChangesAsync();
        return item;
    }

    public async Task DeleteItemAsync(Guid planId, Guid itemId)
    {
        var item = await _unitOfWork.Repository<TrainingPlanItem>().GetByIdAsync(itemId);
        if (item != null && item.TrainingPlanId == planId)
        {
            item.IsDeleted = true;
            await _unitOfWork.Repository<TrainingPlanItem>().UpdateAsync(item);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task CompleteItemAsync(Guid planId, Guid itemId)
    {
        var item = await _unitOfWork.Repository<TrainingPlanItem>().GetByIdAsync(itemId);
        if (item != null && item.TrainingPlanId == planId)
        {
            item.IsCompleted = true;
            await _unitOfWork.Repository<TrainingPlanItem>().UpdateAsync(item);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}

