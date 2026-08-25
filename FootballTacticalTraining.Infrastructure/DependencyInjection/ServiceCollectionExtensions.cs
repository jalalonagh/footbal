using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Application.Services;
using FootballTacticalTraining.Infrastructure.Audit;
using FootballTacticalTraining.Infrastructure.Data;
using FootballTacticalTraining.Infrastructure.Payment;
using FootballTacticalTraining.Infrastructure.Services;
using FootballTacticalTraining.Infrastructure.Tactical;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FootballTacticalTraining.Infrastructure.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped(typeof(IRepository<>), typeof(EFRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ISubscriptionService, SubscriptionService>();
        services.AddScoped<IScenarioService, ScenarioService>();
        services.AddScoped<IScenarioPlayerService, ScenarioPlayerService>();
        services.AddScoped<IScenarioSolutionService, ScenarioSolutionService>();
        services.AddScoped<IScenarioRuleService, ScenarioRuleService>();
        services.AddScoped<ITacticalEngine, TacticalEngine>();
        services.AddScoped<IEvaluationEngine, EvaluationEngine>();
        services.AddScoped<ISimulationEngine, SimulationEngine>();

        services.AddHttpClient<IPaymentGateway, ZarinPalPaymentGateway>();
        services.Configure<ZarinPalSettings>(configuration.GetSection("ZarinPal"));
        services.AddSingleton<PaymentSettingsService>();

        services.AddScoped<IAuditService, AuditService>();

        services.AddScoped<ITrainingSessionService, TrainingSessionService>();
        services.AddScoped<ITrainingPlanService, TrainingPlanService>();
        services.AddScoped<IPlayerProgressService, PlayerProgressService>();
        services.AddScoped<IPlayerProfileService, PlayerProfileService>();
        services.AddScoped<ITeamService, TeamService>();
        services.AddScoped<IAcademyService, AcademyService>();
        services.AddScoped<IStatisticsService, StatisticsService>();
        services.AddScoped<IEmailService, EmailService>();
        services.Configure<EmailSettings>(configuration.GetSection("Email"));
        services.AddScoped<IDiscountService, DiscountService>();

        services.AddHttpClient<IAIService, AIService>();
        services.Configure<AISettings>(configuration.GetSection("AI"));

        var redisConnection = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrEmpty(redisConnection))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnection;
                options.InstanceName = "football:";
            });
        }
        else
        {
            services.AddDistributedMemoryCache();
        }

        return services;
    }
}
