using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace FootballTacticalTraining.Application.Services;

public class AuthService : IAuthService
{
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

    public async Task<string> GenerateRefreshTokenAsync(Guid userId)
    {
        var tokenBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(tokenBytes);
        var refreshToken = Convert.ToBase64String(tokenBytes);

        var entity = new RefreshToken
        {
            UserId = userId,
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
