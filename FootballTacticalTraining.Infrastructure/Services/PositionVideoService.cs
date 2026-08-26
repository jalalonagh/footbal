using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballTacticalTraining.Infrastructure.Services;

public class PositionVideoService : IPositionVideoService
{
    private readonly AppDbContext _context;

    public PositionVideoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<PositionVideo>> GetByPositionIdAsync(Guid positionId)
    {
        return await _context.PositionVideos
            .Where(v => v.PositionId == positionId && v.IsActive && !v.IsDeleted)
            .OrderBy(v => v.DisplayOrder)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<PositionVideo?> GetByIdAsync(Guid id)
    {
        return await _context.PositionVideos.FindAsync(id);
    }

    public async Task<PositionVideo> CreateAsync(PositionVideo video)
    {
        _context.PositionVideos.Add(video);
        await _context.SaveChangesAsync();
        return video;
    }

    public async Task<PositionVideo> UpdateAsync(PositionVideo video)
    {
        _context.PositionVideos.Update(video);
        await _context.SaveChangesAsync();
        return video;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var video = await _context.PositionVideos.FindAsync(id);
        if (video == null) return false;
        video.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }
}
