using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Infrastructure.Services;

public class StatisticsService : IStatisticsService
{
    private readonly IUnitOfWork _unitOfWork;

    public StatisticsService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PlayerDashboardStats> GetPlayerStatsAsync(Guid playerId)
    {
        var sessions = await _unitOfWork.Repository<TrainingSession>()
            .FindAsync(s => s.PlayerProfileId == playerId && !s.IsDeleted);
        var completed = sessions.Where(s => s.IsCompleted).ToList();
        var achievements = await _unitOfWork.Repository<UserAchievement>()
            .FindAsync(p => p.UserId == playerId && !p.IsDeleted);
        var progresses = await _unitOfWork.Repository<PlayerProgress>()
            .FindAsync(p => p.PlayerProfileId == playerId && !p.IsDeleted);

        var allDecisions = completed.Sum(s => s.TotalDecisions);
        var correctDecisions = completed.Sum(s => s.CorrectDecisions);

        return new PlayerDashboardStats
        {
            TotalSessions = sessions.Count(),
            CompletedSessions = completed.Count(),
            AverageScore = completed.Any() ? completed.Average(s => s.OverallScore) : 0,
            BestScore = completed.Any() ? completed.Max(s => s.OverallScore) : 0,
            TotalDecisions = allDecisions,
            CorrectDecisions = correctDecisions,
            Accuracy = allDecisions > 0 ? correctDecisions * 100m / allDecisions : 0,
            ScenariosCompleted = completed.Select(s => s.ScenarioId).Distinct().Count(),
            AchievementsCount = achievements.Count(),
            CurrentStreak = CalculateStreak(completed),
            SkillScores = progresses.Select(p => new SkillCategoryScore
            {
                Category = p.SkillCategory,
                Score = p.CurrentScore,
                PreviousScore = p.PreviousScore,
                Improvement = p.Improvement
            }).ToList(),
            RecentSessions = completed
                .OrderByDescending(s => s.CompletedAt)
                .Take(5)
                .Select(s => new RecentSessionSummary
                {
                    SessionId = s.Id,
                    Score = s.OverallScore,
                    CompletedAt = s.CompletedAt ?? DateTime.MinValue,
                    TotalDecisions = s.TotalDecisions,
                    CorrectDecisions = s.CorrectDecisions
                }).ToList()
        };
    }

    public async Task<CoachDashboardStats> GetCoachStatsAsync(Guid coachId)
    {
        var teams = await _unitOfWork.Repository<Team>()
            .FindAsync(t => t.CoachProfileId == coachId && !t.IsDeleted);
        var teamIds = teams.Select(t => t.Id).ToList();
        var teamPlayers = await _unitOfWork.Repository<TeamPlayer>()
            .FindAsync(tp => teamIds.Contains(tp.TeamId));
        var playerIds = teamPlayers.Select(tp => tp.PlayerProfileId).Distinct().ToList();

        var allSessions = new List<TrainingSession>();
        foreach (var pid in playerIds)
        {
            var sessions = await _unitOfWork.Repository<TrainingSession>()
                .FindAsync(s => s.PlayerProfileId == pid && !s.IsDeleted);
            allSessions.AddRange(sessions);
        }

        var completed = allSessions.Where(s => s.IsCompleted).ToList();
        var avgScore = completed.Any() ? completed.Average(s => s.OverallScore) : 0;
        var scenarios = await _unitOfWork.Repository<Scenario>().FindAsync(s => !s.IsDeleted);

        var playerStats = playerIds.Select(pid => {
            var ps = completed.Where(s => s.PlayerProfileId == pid).ToList();
            return new PlayerSummary
            {
                PlayerId = pid,
                AverageScore = ps.Any() ? ps.Average(s => s.OverallScore) : 0,
                TotalSessions = ps.Count()
            };
        }).ToList();

        return new CoachDashboardStats
        {
            TotalPlayers = playerIds.Count(),
            TotalTeams = teams.Count(),
            ActiveTeams = teams.Count(),
            AveragePlayerScore = avgScore,
            TotalSessions = completed.Count(),
            TotalScenarios = scenarios.Count(),
            TopPlayers = playerStats.OrderByDescending(p => p.AverageScore).Take(5).ToList(),
            NeedsImprovement = playerStats.Where(p => p.AverageScore < 50 && p.TotalSessions > 0)
                .OrderBy(p => p.AverageScore).Take(5).ToList()
        };
    }

    public async Task<AdminDashboardStats> GetAdminStatsAsync()
    {
        var users = await _unitOfWork.Repository<Domain.Entities.Auth.User>().FindAsync(u => !u.IsDeleted);
        var playerProfiles = await _unitOfWork.Repository<Domain.Entities.Auth.PlayerProfile>().FindAsync(p => !p.IsDeleted);
        var coachProfiles = await _unitOfWork.Repository<Domain.Entities.Auth.CoachProfile>().FindAsync(c => !c.IsDeleted);
        var academies = await _unitOfWork.Repository<Academy>().FindAsync(a => !a.IsDeleted);
        var teams = await _unitOfWork.Repository<Team>().FindAsync(t => !t.IsDeleted);
        var sessions = await _unitOfWork.Repository<TrainingSession>().FindAsync(s => !s.IsDeleted);
        var scenarios = await _unitOfWork.Repository<Scenario>().FindAsync(s => !s.IsDeleted);
        var subscriptions = await _unitOfWork.Repository<Domain.Entities.Subscriptions.Subscription>()
            .FindAsync(p => p.Status == Domain.Enums.SubscriptionStatus.Active);
        var payments = await _unitOfWork.Repository<Domain.Entities.Subscriptions.Payment>()
            .FindAsync(p => p.Status == Domain.Enums.PaymentStatus.Completed);

        return new AdminDashboardStats
        {
            TotalUsers = users.Count(),
            TotalPlayers = playerProfiles.Count(),
            TotalCoaches = coachProfiles.Count(),
            TotalAcademies = academies.Count(),
            TotalTeams = teams.Count(),
            TotalSessions = sessions.Count(),
            TotalScenarios = scenarios.Count(),
            ActiveSubscriptions = subscriptions.Count(),
            TotalRevenue = payments.Sum(p => p.Amount),
            NewUsersThisMonth = users.Count(u => u.CreatedAt >= DateTime.UtcNow.AddMonths(-1))
        };
    }

    public async Task<List<PlayerRanking>> GetTopPlayersAsync(int count = 10)
    {
        var profiles = await _unitOfWork.Repository<Domain.Entities.Auth.PlayerProfile>().FindAsync(p => !p.IsDeleted);
        var rankings = new List<PlayerRanking>();

        foreach (var profile in profiles)
        {
            var sessions = await _unitOfWork.Repository<TrainingSession>()
                .FindAsync(s => s.PlayerProfileId == profile.Id && s.IsCompleted && !s.IsDeleted);
            if (sessions.Any())
            {
                rankings.Add(new PlayerRanking
                {
                    PlayerId = profile.Id,
                    AverageScore = sessions.Average(s => s.OverallScore),
                    TotalSessions = sessions.Count()
                });
            }
        }

        return rankings
            .OrderByDescending(r => r.AverageScore)
            .Take(count)
            .Select((r, i) => { r.Rank = i + 1; return r; })
            .ToList();
    }

    public async Task<List<SkillTrend>> GetSkillTrendsAsync(Guid playerId, int days = 30)
    {
        var sessions = await _unitOfWork.Repository<TrainingSession>()
            .FindAsync(s => s.PlayerProfileId == playerId && s.IsCompleted && !s.IsDeleted);
        var cutoff = DateTime.UtcNow.AddDays(-days);

        return sessions
            .Where(s => s.CompletedAt >= cutoff)
            .OrderBy(s => s.CompletedAt)
            .Select(s => new SkillTrend
            {
                Date = s.CompletedAt ?? DateTime.MinValue,
                Score = s.OverallScore,
                SkillCategory = s.Mode.ToString()
            }).ToList();
    }

    private static int CalculateStreak(List<TrainingSession> completed)
    {
        if (!completed.Any()) return 0;
        var sorted = completed
            .Where(s => s.CompletedAt.HasValue)
            .OrderByDescending(s => s.CompletedAt)
            .ToList();

        int streak = 0;
        var today = DateTime.UtcNow.Date;
        for (int i = 0; i < sorted.Count(); i++)
        {
            var sessionDate = sorted[i].CompletedAt!.Value.Date;
            var expectedDate = today.AddDays(-i);
            if (sessionDate == expectedDate || (i > 0 && sessionDate == today.AddDays(-(i - 1))))
            {
                streak++;
            }
            else break;
        }
        return streak;
    }
}

