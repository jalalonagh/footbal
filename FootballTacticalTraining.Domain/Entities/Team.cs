using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Domain.Entities;

public class Team : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? CoachProfileId { get; set; }
    public CoachProfile? CoachProfile { get; set; }
    public Guid? AcademyId { get; set; }
    public Academy? Academy { get; set; }
    public string? Formation { get; set; }
    public ICollection<TeamPlayer> TeamPlayers { get; set; } = new List<TeamPlayer>();
    public ICollection<TrainingSession> TrainingSessions { get; set; } = new List<TrainingSession>();
}