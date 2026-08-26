using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Entities.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace FootballTacticalTraining.Application.Services;

public class AuthService : IAuthService
{
    private const int MaxDevices = 2;
    private readonly IConfiguration _configuration;
    private readonly IUnitOfWork _unitOfWork;

    public AuthService(IConfiguration configuration, IUnitOfWork unitOfWork)
    {
        _configuration = configuration;
        _unitOfWork = unitOfWork;
    }

    public async Task<string> GenerateJwtTokenAsync(Guid userId, string email, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(Convert.ToDouble(_configuration["Jwt:ExpiryHours"] ?? "24")),
            signingCredentials: credentials);

        return await Task.FromResult(new JwtSecurityTokenHandler().WriteToken(token));
    }

    public async Task<string> GenerateRefreshTokenAsync(Guid userId, string deviceInfo, string? ipAddress)
    {
        var existingDevices = (await _unitOfWork.Repository<UserDevice>()
            .FindAsync(d => d.UserId == userId && !d.IsDeleted))
            .ToList();

        var existingDevice = existingDevices.FirstOrDefault(d => d.DeviceInfo == deviceInfo);

        if (existingDevice == null)
        {
            if (existingDevices.Count >= MaxDevices)
            {
                throw new InvalidOperationException("Device limit reached. Please logout from another device first.");
            }

            existingDevice = new UserDevice
            {
                UserId = userId,
                DeviceInfo = deviceInfo,
                IpAddress = ipAddress,
                LastActiveAt = DateTime.UtcNow
            };
            await _unitOfWork.Repository<UserDevice>().AddAsync(existingDevice);
            await _unitOfWork.SaveChangesAsync();
        }
        else
        {
            existingDevice.LastActiveAt = DateTime.UtcNow;
            existingDevice.IpAddress = ipAddress;
            await _unitOfWork.Repository<UserDevice>().UpdateAsync(existingDevice);
        }

        var tokenBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(tokenBytes);
        var refreshToken = Convert.ToBase64String(tokenBytes);

        var entity = new RefreshToken
        {
            UserId = userId,
            DeviceId = existingDevice.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };

        await _unitOfWork.Repository<RefreshToken>().AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();

        return refreshToken;
    }

    public async Task<Guid?> ValidateRefreshTokenAsync(string token)
    {
        var tokens = await _unitOfWork.Repository<RefreshToken>()
            .FindAsync(t => t.Token == token && !t.IsRevoked && t.ExpiresAt > DateTime.UtcNow);
        var refreshToken = tokens.FirstOrDefault();
        return refreshToken?.UserId;
    }

    public async Task RevokeRefreshTokenAsync(string token, string? replacedByToken = null)
    {
        var tokens = await _unitOfWork.Repository<RefreshToken>()
            .FindAsync(t => t.Token == token);
        var refreshToken = tokens.FirstOrDefault();
        if (refreshToken != null)
        {
            refreshToken.IsRevoked = true;
            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.ReplacedByToken = replacedByToken;
            await _unitOfWork.Repository<RefreshToken>().UpdateAsync(refreshToken);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task<int> GetActiveDeviceCountAsync(Guid userId)
    {
        var devices = await _unitOfWork.Repository<UserDevice>()
            .FindAsync(d => d.UserId == userId && !d.IsDeleted);
        return devices.Count();
    }

    public async Task<bool> CanAddDeviceAsync(Guid userId)
    {
        var count = await GetActiveDeviceCountAsync(userId);
        return count < MaxDevices;
    }

    public async Task<List<UserDevice>> GetUserDevicesAsync(Guid userId)
    {
        var devices = (await _unitOfWork.Repository<UserDevice>()
            .FindAsync(d => d.UserId == userId && !d.IsDeleted))
            .OrderByDescending(d => d.LastActiveAt)
            .ToList();
        return devices;
    }

    public async Task RevokeDeviceAsync(Guid deviceId)
    {
        var device = await _unitOfWork.Repository<UserDevice>().GetByIdAsync(deviceId);
        if (device == null) return;

        var refreshTokens = (await _unitOfWork.Repository<RefreshToken>()
            .FindAsync(t => t.DeviceId == deviceId && !t.IsRevoked))
            .ToList();

        foreach (var token in refreshTokens)
        {
            token.IsRevoked = true;
            token.RevokedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<RefreshToken>().UpdateAsync(token);
        }

        device.IsDeleted = true;
        await _unitOfWork.Repository<UserDevice>().UpdateAsync(device);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task RevokeAllDevicesExceptCurrentAsync(Guid userId, Guid currentDeviceId)
    {
        var devices = (await _unitOfWork.Repository<UserDevice>()
            .FindAsync(d => d.UserId == userId && d.Id != currentDeviceId && !d.IsDeleted))
            .ToList();

        foreach (var device in devices)
        {
            await RevokeDeviceAsync(device.Id);
        }
    }

    public async Task<string> HashPasswordAsync(string password)
    {
        return await Task.FromResult(BCrypt.Net.BCrypt.HashPassword(password));
    }

    public async Task<bool> VerifyPasswordAsync(string password, string hash)
    {
        return await Task.FromResult(BCrypt.Net.BCrypt.Verify(password, hash));
    }

    public async Task<Guid?> ValidateTokenAsync(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = _configuration["Jwt:Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out var validatedToken);

            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim != null && Guid.TryParse(userIdClaim, out var userId))
            {
                return await Task.FromResult<Guid?>(userId);
            }
            return await Task.FromResult<Guid?>(null);
        }
        catch
        {
            return await Task.FromResult<Guid?>(null);
        }
    }
}
