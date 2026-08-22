using System.Security.Claims;
using FootballTacticalTraining.Domain.Entities.Tactical;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace FootballTacticalTraining.Infrastructure.Audit;

public interface IAuditService
{
    Task LogAsync(string action, string entityName, string? entityId = null, string? oldValue = null, string? newValue = null, HttpContext? context = null);
}

public class AuditService : IAuditService
{
    private readonly Data.AppDbContext _dbContext;
    private readonly ILogger<AuditService> _logger;

    public AuditService(Data.AppDbContext dbContext, ILogger<AuditService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task LogAsync(string action, string entityName, string? entityId = null, string? oldValue = null, string? newValue = null, HttpContext? context = null)
    {
        try
        {
            var log = new AuditLog
            {
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                OldValue = oldValue,
                NewValue = newValue,
                Timestamp = DateTime.UtcNow
            };

            if (context != null)
            {
                var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (Guid.TryParse(userIdStr, out var userId)) log.UserId = userId;
                log.UserName = context.User.FindFirst(ClaimTypes.Email)?.Value;
                log.IpAddress = context.Connection.RemoteIpAddress?.ToString();
                log.UserAgent = context.Request.Headers.UserAgent.ToString();
            }

            _dbContext.AuditLogs.Add(log);
            await _dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write audit log for {Action} on {EntityName}", action, entityName);
        }
    }
}
