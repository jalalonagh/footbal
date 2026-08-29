using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballTacticalTraining.Infrastructure.Services;

public class AiLogService
{
    private readonly AppDbContext _context;

    public AiLogService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AiLog> LogAsync(AiLog log)
    {
        _context.AiLogs.Add(log);
        await _context.SaveChangesAsync();
        return log;
    }

    public async Task<List<AiLog>> GetLogsAsync(
        int page = 1, int pageSize = 50,
        string? search = null,
        string? endpoint = null,
        Guid? userId = null,
        DateTime? from = null,
        DateTime? to = null)
    {
        var query = _context.AiLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(l => l.RequestBody.Contains(search) || l.ResponseBody.Contains(search) || (l.ErrorMessage != null && l.ErrorMessage.Contains(search)));

        if (!string.IsNullOrWhiteSpace(endpoint))
            query = query.Where(l => l.Endpoint == endpoint);

        if (userId.HasValue)
            query = query.Where(l => l.UserId == userId);

        if (from.HasValue)
            query = query.Where(l => l.CreatedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(l => l.CreatedAt <= to.Value);

        return await query.OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetCountAsync(
        string? search = null,
        string? endpoint = null,
        Guid? userId = null,
        DateTime? from = null,
        DateTime? to = null)
    {
        var query = _context.AiLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(l => l.RequestBody.Contains(search) || l.ResponseBody.Contains(search) || (l.ErrorMessage != null && l.ErrorMessage.Contains(search)));

        if (!string.IsNullOrWhiteSpace(endpoint))
            query = query.Where(l => l.Endpoint == endpoint);

        if (userId.HasValue)
            query = query.Where(l => l.UserId == userId);

        if (from.HasValue)
            query = query.Where(l => l.CreatedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(l => l.CreatedAt <= to.Value);

        return await query.CountAsync();
    }

    public async Task<AiLog?> GetByIdAsync(Guid id)
    {
        return await _context.AiLogs.FindAsync(id);
    }
}
