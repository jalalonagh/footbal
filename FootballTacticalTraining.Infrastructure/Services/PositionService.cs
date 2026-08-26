using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballTacticalTraining.Infrastructure.Services;

public class PositionService : IPositionService
{
    private readonly AppDbContext _context;

    public PositionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Position>> GetAllPositionsAsync(bool includeInactive = false)
    {
        var query = _context.Positions
            .Where(p => p.IsActive || includeInactive)
            .OrderBy(p => p.DisplayOrder)
            .AsNoTracking();

        return await query.ToListAsync();
    }

    public async Task<Position?> GetPositionByIdAsync(Guid id)
    {
        return await _context.Positions
            .Include(p => p.UserPositions)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Position> CreatePositionAsync(Position position)
    {
        _context.Positions.Add(position);
        await _context.SaveChangesAsync();
        return position;
    }

    public async Task<Position> UpdatePositionAsync(Position position)
    {
        _context.Positions.Update(position);
        await _context.SaveChangesAsync();
        return position;
    }

    public async Task<bool> DeletePositionAsync(Guid id)
    {
        var position = await _context.Positions.FindAsync(id);
        if (position == null) return false;

        _context.Positions.Remove(position);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<UserPosition?> GetUserPositionAsync(Guid userId)
    {
        return await _context.UserPositions
            .Include(up => up.Position)
            .FirstOrDefaultAsync(up => up.UserId == userId && up.IsActive);
    }

    public async Task<UserPosition> SelectPositionAsync(Guid userId, Guid positionId)
    {
        var existing = await _context.UserPositions
            .FirstOrDefaultAsync(up => up.UserId == userId && up.PositionId == positionId && up.IsActive);

        if (existing != null)
            return existing;

        var otherActive = await _context.UserPositions
            .FirstOrDefaultAsync(up => up.UserId == userId && up.IsActive);

        if (otherActive != null)
        {
            otherActive.IsActive = false;
            _context.UserPositions.Update(otherActive);
        }

        var userPosition = new UserPosition
        {
            UserId = userId,
            PositionId = positionId,
            SelectedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.UserPositions.Add(userPosition);
        await _context.SaveChangesAsync();

        return await _context.UserPositions
            .Include(up => up.Position)
            .FirstAsync(up => up.Id == userPosition.Id);
    }

    public async Task<bool> RemoveUserPositionAsync(Guid userId)
    {
        var userPosition = await _context.UserPositions
            .FirstOrDefaultAsync(up => up.UserId == userId && up.IsActive);

        if (userPosition == null) return false;

        userPosition.IsActive = false;
        _context.UserPositions.Update(userPosition);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<UserPosition>> GetAllUserPositionsAsync()
    {
        return await _context.UserPositions
            .Include(up => up.User)
            .Include(up => up.Position)
            .Where(up => up.IsActive)
            .AsNoTracking()
            .ToListAsync();
    }
}
