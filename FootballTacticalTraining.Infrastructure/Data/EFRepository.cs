using System.Linq.Expressions;
using FootballTacticalTraining.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FootballTacticalTraining.Infrastructure.Data;

public class EFRepository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public EFRepository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(Guid id) => await _dbSet.FindAsync(id);
    public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();
    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate) => await _dbSet.Where(predicate).ToListAsync();
    public async Task<T> AddAsync(T entity) { await _dbSet.AddAsync(entity); return entity; }
    public async Task UpdateAsync(T entity) { _dbSet.Update(entity); await Task.CompletedTask; }
    public async Task DeleteAsync(T entity) { _dbSet.Remove(entity); await Task.CompletedTask; }
    public async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null) => predicate == null ? await _dbSet.CountAsync() : await _dbSet.CountAsync(predicate);
    public async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate) => await _dbSet.AnyAsync(predicate);
    public DbContext GetDbContext() => _context;
}
