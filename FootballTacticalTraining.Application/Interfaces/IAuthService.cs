namespace FootballTacticalTraining.Application.Interfaces;

public interface IAuthService
{
    Task<string> GenerateJwtTokenAsync(Guid userId, string email, string role);
    Task<string> GenerateRefreshTokenAsync(Guid userId);
    Task<Guid?> ValidateRefreshTokenAsync(string token);
    Task RevokeRefreshTokenAsync(string token, string? replacedByToken = null);
    Task<string> HashPasswordAsync(string password);
    Task<bool> VerifyPasswordAsync(string password, string hash);
    Task<Guid?> ValidateTokenAsync(string token);
}
