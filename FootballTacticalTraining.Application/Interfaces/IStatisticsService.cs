namespace FootballTacticalTraining.Application.Interfaces;

public interface IStatisticsService
{
    Task<PlayerDashboardStats> GetPlayerStatsAsync(Guid playerId);
    Task<CoachDashboardStats> GetCoachStatsAsync(Guid coachId);
    Task<AdminDashboardStats> GetAdminStatsAsync();
    Task<List<PlayerRanking>> GetTopPlayersAsync(int count = 10);
    Task<List<SkillTrend>> GetSkillTrendsAsync(Guid playerId, int days = 30);
}

public class PlayerDashboardStats
{
    public int TotalSessions { get; set; }
    public int CompletedSessions { get; set; }
    public decimal AverageScore { get; set; }
    public decimal BestScore { get; set; }
    public int TotalDecisions { get; set; }
    public int CorrectDecisions { get; set; }
    public decimal Accuracy { get; set; }
    public int ScenariosCompleted { get; set; }
    public int AchievementsCount { get; set; }
    public int CurrentStreak { get; set; }
    public List<SkillCategoryScore> SkillScores { get; set; } = new();
    public List<RecentSessionSummary> RecentSessions { get; set; } = new();
}

public class CoachDashboardStats
{
    public int TotalPlayers { get; set; }
    public int TotalTeams { get; set; }
    public int ActiveTeams { get; set; }
    public decimal AveragePlayerScore { get; set; }
    public int TotalSessions { get; set; }
    public int TotalScenarios { get; set; }
    public List<PlayerSummary> TopPlayers { get; set; } = new();
    public List<PlayerSummary> NeedsImprovement { get; set; } = new();
}

public class AdminDashboardStats
{
    public int TotalUsers { get; set; }
    public int TotalPlayers { get; set; }
    public int TotalCoaches { get; set; }
    public int TotalAcademies { get; set; }
    public int TotalTeams { get; set; }
    public int TotalSessions { get; set; }
    public int TotalScenarios { get; set; }
    public int ActiveSubscriptions { get; set; }
    public decimal TotalRevenue { get; set; }
    public int NewUsersThisMonth { get; set; }
}

public class PlayerRanking
{
    public Guid PlayerId { get; set; }
    public string PlayerName { get; set; } = string.Empty;
    public decimal AverageScore { get; set; }
    public int TotalSessions { get; set; }
    public int Rank { get; set; }
}

public class SkillTrend
{
    public DateTime Date { get; set; }
    public decimal Score { get; set; }
    public string SkillCategory { get; set; } = string.Empty;
}

public class SkillCategoryScore
{
    public string Category { get; set; } = string.Empty;
    public decimal Score { get; set; }
    public decimal PreviousScore { get; set; }
    public decimal Improvement { get; set; }
}

public class RecentSessionSummary
{
    public Guid SessionId { get; set; }
    public string ScenarioName { get; set; } = string.Empty;
    public decimal Score { get; set; }
    public DateTime CompletedAt { get; set; }
    public int TotalDecisions { get; set; }
    public int CorrectDecisions { get; set; }
}

public class PlayerSummary
{
    public Guid PlayerId { get; set; }
    public string PlayerName { get; set; } = string.Empty;
    public decimal AverageScore { get; set; }
    public int TotalSessions { get; set; }
}
