using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Application.Services;
using FootballTacticalTraining.Infrastructure.Data;
using FootballTacticalTraining.Infrastructure.Payment;
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
        services.AddScoped<ITacticalEngine, TacticalEngine>();
        services.AddScoped<IEvaluationEngine, EvaluationEngine>();

        services.AddScoped<IPaymentGateway, ZarinPalPaymentGateway>();
        services.Configure<ZarinPalSettings>(configuration.GetSection("ZarinPal"));

        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration.GetConnectionString("Redis");
        });

        return services;
    }
}
