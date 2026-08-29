using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Entities.Auth;
using FootballTacticalTraining.Domain.Entities.CMS;
using FootballTacticalTraining.Domain.Entities.Subscriptions;
using FootballTacticalTraining.Domain.Entities.Tactical;
using Microsoft.EntityFrameworkCore;

namespace FootballTacticalTraining.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<PlayerProfile> PlayerProfiles => Set<PlayerProfile>();
    public DbSet<CoachProfile> CoachProfiles => Set<CoachProfile>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamPlayer> TeamPlayers => Set<TeamPlayer>();
    public DbSet<Academy> Academies => Set<Academy>();
    public DbSet<Position> Positions => Set<Position>();
    public DbSet<Formation> Formations => Set<Formation>();
    public DbSet<Scenario> Scenarios => Set<Scenario>();
    public DbSet<ScenarioPlayer> ScenarioPlayers => Set<ScenarioPlayer>();
    public DbSet<ScenarioSolution> ScenarioSolutions => Set<ScenarioSolution>();
    public DbSet<ScenarioAction> ScenarioActions => Set<ScenarioAction>();
    public DbSet<ScenarioRule> ScenarioRules => Set<ScenarioRule>();
    public DbSet<TrainingSession> TrainingSessions => Set<TrainingSession>();
    public DbSet<TrainingResult> TrainingResults => Set<TrainingResult>();
    public DbSet<Decision> Decisions => Set<Decision>();
    public DbSet<PlayerProgress> PlayerProgresses => Set<PlayerProgress>();
    public DbSet<PlayerSkill> PlayerSkills => Set<PlayerSkill>();
    public DbSet<TrainingPlan> TrainingPlans => Set<TrainingPlan>();
    public DbSet<TrainingPlanItem> TrainingPlanItems => Set<TrainingPlanItem>();
    public DbSet<Achievement> Achievements => Set<Achievement>();
    public DbSet<UserAchievement> UserAchievements => Set<UserAchievement>();
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<FootballTacticalTraining.Domain.Entities.Subscriptions.Payment> Payments => Set<FootballTacticalTraining.Domain.Entities.Subscriptions.Payment>();
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();
    public DbSet<Feature> Features => Set<Feature>();
    public DbSet<PlanFeature> PlanFeatures => Set<PlanFeature>();
    public DbSet<UserEntitlement> UserEntitlements => Set<UserEntitlement>();
    public DbSet<SeoPage> SeoPages => Set<SeoPage>();
    public DbSet<Article> Articles => Set<Article>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ArticleTag> ArticleTags => Set<ArticleTag>();
    public DbSet<ArticleTranslation> ArticleTranslations => Set<ArticleTranslation>();
    public DbSet<Faq> Faqs => Set<Faq>();
    public DbSet<ContactSetting> ContactSettings => Set<ContactSetting>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketMessage> TicketMessages => Set<TicketMessage>();
    public DbSet<Discount> Discounts => Set<Discount>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<TacticalRule> TacticalRules => Set<TacticalRule>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<UserDevice> UserDevices => Set<UserDevice>();
    public DbSet<UserPosition> UserPositions => Set<UserPosition>();
    public DbSet<PositionVideo> PositionVideos => Set<PositionVideo>();
    public DbSet<AiLog> AiLogs => Set<AiLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType).Property<DateTime>("CreatedAt").HasDefaultValueSql("GETUTCDATE()");
                modelBuilder.Entity(entityType.ClrType).Property<bool>("IsDeleted").HasDefaultValue(false);
            }
        }

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(256);
            e.Property(u => u.FirstName).HasMaxLength(100);
            e.Property(u => u.LastName).HasMaxLength(100);
        });

        modelBuilder.Entity<Scenario>(e =>
        {
            e.HasIndex(s => s.Status);
            e.HasIndex(s => s.Category);
            e.HasIndex(s => s.Difficulty);
        });

        modelBuilder.Entity<SubscriptionPlan>(e =>
        {
            e.Property(p => p.Price).HasColumnType("decimal(18,2)");
            e.Property(p => p.DiscountPrice).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<FootballTacticalTraining.Domain.Entities.Subscriptions.Payment>(e =>
        {
            e.Property(p => p.Amount).HasColumnType("decimal(18,2)");
            e.HasIndex(p => p.Authority);
            e.HasIndex(p => p.ReferenceId);
            e.HasOne(p => p.Subscription).WithMany(s => s.Payments).HasForeignKey(p => p.SubscriptionId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(p => p.Plan).WithMany().HasForeignKey(p => p.PlanId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(p => p.User).WithMany().HasForeignKey(p => p.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Subscription>(e =>
        {
            e.HasOne(s => s.Payment).WithMany().HasForeignKey(s => s.PaymentId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ArticleTag>(e =>
        {
            e.HasKey(at => new { at.ArticleId, at.TagId });
        });

        modelBuilder.Entity<ArticleTranslation>(e =>
        {
            e.HasKey(at => new { at.ArticleId, at.Language });
            e.HasOne(at => at.Article).WithMany(a => a.Translations).HasForeignKey(at => at.ArticleId);
        });

        modelBuilder.Entity<TeamPlayer>(e =>
        {
            e.HasKey(tp => new { tp.TeamId, tp.PlayerProfileId });
        });

        modelBuilder.Entity<PlanFeature>(e =>
        {
            e.HasKey(pf => new { pf.PlanId, pf.FeatureId });
        });

        modelBuilder.Entity<UserEntitlement>(e =>
        {
            e.HasIndex(ue => new { ue.UserId, ue.FeatureId });
        });

        modelBuilder.Entity<SeoPage>(e =>
        {
            e.HasIndex(s => s.Slug).IsUnique();
            e.HasIndex(s => s.Url).IsUnique();
        });

        modelBuilder.Entity<ScenarioSolution>(e =>
        {
            e.Property(s => s.OptimalX).HasColumnType("decimal(18,2)");
            e.Property(s => s.OptimalY).HasColumnType("decimal(18,2)");
            e.Property(s => s.Score).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Decision>(e =>
        {
            e.Property(d => d.UserX).HasColumnType("decimal(18,2)");
            e.Property(d => d.UserY).HasColumnType("decimal(18,2)");
            e.Property(d => d.OptimalX).HasColumnType("decimal(18,2)");
            e.Property(d => d.OptimalY).HasColumnType("decimal(18,2)");
            e.Property(d => d.Score).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Discount>(e =>
        {
            e.Property(d => d.Percentage).HasColumnType("decimal(5,2)");
            e.Property(d => d.FixedAmount).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Coupon>(e =>
        {
            e.HasIndex(c => c.Code).IsUnique();
        });

        modelBuilder.Entity<TrainingResult>(e =>
        {
            e.HasOne(t => t.TrainingSession).WithMany(s => s.Results).HasForeignKey(t => t.TrainingSessionId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(t => t.PlayerProfile).WithMany().HasForeignKey(t => t.PlayerProfileId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Decision>(e =>
        {
            e.HasOne(d => d.TrainingSession).WithMany(s => s.Decisions).HasForeignKey(d => d.TrainingSessionId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Ticket>(e =>
        {
            e.HasOne(t => t.User).WithMany().HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<TicketMessage>(e =>
        {
            e.HasOne(m => m.Ticket).WithMany(t => t.Messages).HasForeignKey(m => m.TicketId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(m => m.Sender).WithMany().HasForeignKey(m => m.SenderId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<UserDevice>(e =>
        {
            e.HasOne(d => d.User).WithMany().HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasOne(r => r.Device).WithMany(d => d.RefreshTokens).HasForeignKey(r => r.DeviceId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Position>(e =>
        {
            e.Property(p => p.Code).HasMaxLength(20);
            e.Property(p => p.Name).HasMaxLength(100);
            e.Property(p => p.NameFa).HasMaxLength(100);
            e.Property(p => p.Category).HasMaxLength(50);
            e.HasIndex(p => p.Code).IsUnique();
        });

        modelBuilder.Entity<UserPosition>(e =>
        {
            e.HasOne(up => up.User).WithMany().HasForeignKey(up => up.UserId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(up => up.Position).WithMany(p => p.UserPositions).HasForeignKey(up => up.PositionId).OnDelete(DeleteBehavior.NoAction);
            e.HasIndex(up => new { up.UserId, up.PositionId }).IsUnique();
        });

        modelBuilder.Entity<PositionVideo>(e =>
        {
            e.HasOne(pv => pv.Position).WithMany(p => p.Videos).HasForeignKey(pv => pv.PositionId).OnDelete(DeleteBehavior.NoAction);
            e.Property(pv => pv.VideoUrl).HasMaxLength(2048);
            e.Property(pv => pv.ThumbnailUrl).HasMaxLength(2048);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
