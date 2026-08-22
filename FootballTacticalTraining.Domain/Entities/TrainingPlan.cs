using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Domain.Entities;

public class TrainingPlan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? PlayerProfileId { get; set; }
    public PlayerProfile? PlayerProfile { get; set; }
    public Guid? TeamId { get; set; }
    public Team? Team { get; set; }
    public Guid? CreatedByCoachId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<TrainingPlanItem> Items { get; set; } = new List<TrainingPlanItem>();
}
