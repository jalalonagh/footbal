using FootballTacticalTraining.Domain.Entities.Auth;

namespace FootballTacticalTraining.Application.Interfaces;

public interface IAuthService
{
    Task<string> GenerateJwtTokenAsync(Guid userId, string email, string role);
    Task<string> GenerateRefreshTokenAsync(Guid userId, string deviceInfo, string? ipAddress);
    Task<Guid?> ValidateRefreshTokenAsync(string token);
    Task RevokeRefreshTokenAsync(string token, string? replacedByToken = null);
    Task<string> HashPasswordAsync(string password);
    Task<bool> VerifyPasswordAsync(string password, string hash);
    Task<Guid?> ValidateTokenAsync(string token);
    Task<int> GetActiveDeviceCountAsync(Guid userId);
    Task<bool> CanAddDeviceAsync(Guid userId);
    Task<List<UserDevice>> GetUserDevicesAsync(Guid userId);
    Task RevokeDeviceAsync(Guid deviceId);
    Task RevokeAllDevicesExceptCurrentAsync(Guid userId, Guid currentDeviceId);
}
