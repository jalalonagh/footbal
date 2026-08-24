using FootballTacticalTraining.Application.DTOs.Auth;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities.Auth;
using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Infrastructure.Audit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditService _auditService;
    private readonly IEmailService _emailService;

    public AuthController(IAuthService authService, IUnitOfWork unitOfWork, IAuditService auditService, IEmailService emailService)
    {
        _authService = authService;
        _unitOfWork = unitOfWork;
        _auditService = auditService;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        var existingUser = await _unitOfWork.Repository<User>().FindAsync(u => u.Email == dto.Email);
        if (existingUser.Any()) return BadRequest("Email already registered");

        var role = UserRole.Player;
        if (!string.IsNullOrEmpty(dto.Role) && Enum.TryParse<UserRole>(dto.Role, true, out var parsed))
            role = parsed;

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = await _authService.HashPasswordAsync(dto.Password),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            Role = role
        };

        await _unitOfWork.Repository<User>().AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        await _auditService.LogAsync("Register", "User", user.Id.ToString(), null, user.Email, HttpContext);

        try { await _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName); } catch { }

        var token = await _authService.GenerateJwtTokenAsync(user.Id, user.Email, user.Role.ToString());
        var refreshToken = await _authService.GenerateRefreshTokenAsync(user.Id);
        return Ok(new AuthResponseDto(token, refreshToken, user.Email, user.Role.ToString(), user.Id, $"{user.FirstName} {user.LastName}"));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var users = await _unitOfWork.Repository<User>().FindAsync(u => u.Email == dto.Email);
        var user = users.FirstOrDefault();
        if (user == null || !await _authService.VerifyPasswordAsync(dto.Password, user.PasswordHash))
            return Unauthorized("Invalid credentials");

        user.LastLoginAt = DateTime.UtcNow;
        await _unitOfWork.Repository<User>().UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        await _auditService.LogAsync("Login", "User", user.Id.ToString(), null, user.Email, HttpContext);

        var token = await _authService.GenerateJwtTokenAsync(user.Id, user.Email, user.Role.ToString());
        var refreshToken = await _authService.GenerateRefreshTokenAsync(user.Id);
        return Ok(new AuthResponseDto(token, refreshToken, user.Email, user.Role.ToString(), user.Id, $"{user.FirstName} {user.LastName}"));
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var users = await _unitOfWork.Repository<User>().GetAllAsync();
        var list = users.Skip((page - 1) * pageSize).Take(pageSize).Select(u => new
        {
            u.Id, u.Email, u.FirstName, u.LastName, Role = u.Role.ToString(), u.IsActive, u.CreatedAt
        }).ToList();
        return Ok(new { items = list, total = users.Count() });
    }

    [Authorize]
    [HttpGet("debug-claims")]
    public IActionResult DebugClaims()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
        return Ok(claims);
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] string role)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(id);
        if (user == null) return NotFound();
        if (Enum.TryParse<UserRole>(role, true, out var newRole))
        {
            user.Role = newRole;
            user.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<User>().UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
            await _auditService.LogAsync("UpdateRole", "User", id.ToString(), null, role, HttpContext);
        }
        return NoContent();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var users = await _unitOfWork.Repository<User>().FindAsync(u => u.Email == dto.Email);
        var user = users.FirstOrDefault();
        if (user == null) return Ok(new { message = "If the email exists, a reset link has been sent." });

        var resetToken = Guid.NewGuid().ToString("N");
        user.PasswordResetToken = resetToken;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        await _unitOfWork.Repository<User>().UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        try { await _emailService.SendPasswordResetAsync(dto.Email, resetToken); } catch { }

        return Ok(new { message = "If the email exists, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var users = await _unitOfWork.Repository<User>()
            .FindAsync(u => u.PasswordResetToken == dto.Token && u.Email == dto.Email);
        var user = users.FirstOrDefault();
        if (user == null || user.PasswordResetTokenExpiry == null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
            return BadRequest("Invalid or expired reset token");

        user.PasswordHash = await _authService.HashPasswordAsync(dto.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        await _unitOfWork.Repository<User>().UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully" });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user == null) return NotFound();
        return Ok(new
        {
            user.Id, user.Email, user.FirstName, user.LastName,
            Role = user.Role.ToString(), user.IsActive, user.CreatedAt
        });
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user == null) return NotFound();

        if (!string.IsNullOrEmpty(dto.FirstName)) user.FirstName = dto.FirstName;
        if (!string.IsNullOrEmpty(dto.LastName)) user.LastName = dto.LastName;
        if (!string.IsNullOrEmpty(dto.PhoneNumber)) user.PhoneNumber = dto.PhoneNumber;
        user.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<User>().UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        await _auditService.LogAsync("UpdateProfile", "User", userId.ToString(), null, $"{user.FirstName} {user.LastName}", HttpContext);

        return Ok(new { user.Id, user.Email, user.FirstName, user.LastName, user.PhoneNumber });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user == null) return NotFound();

        if (!await _authService.VerifyPasswordAsync(dto.CurrentPassword, user.PasswordHash))
            return BadRequest("Current password is incorrect");

        user.PasswordHash = await _authService.HashPasswordAsync(dto.NewPassword);
        await _unitOfWork.Repository<User>().UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully" });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto dto)
    {
        var userId = await _authService.ValidateRefreshTokenAsync(dto.RefreshToken);
        if (userId == null) return Unauthorized("Invalid or expired refresh token");

        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId.Value);
        if (user == null || !user.IsActive) return Unauthorized("User not found or inactive");

        await _authService.RevokeRefreshTokenAsync(dto.RefreshToken);

        var newToken = await _authService.GenerateJwtTokenAsync(user.Id, user.Email, user.Role.ToString());
        var newRefreshToken = await _authService.GenerateRefreshTokenAsync(user.Id);

        return Ok(new AuthResponseDto(newToken, newRefreshToken, user.Email, user.Role.ToString(), user.Id, $"{user.FirstName} {user.LastName}"));
    }

    [HttpPost("setup-admin")]
    public async Task<IActionResult> SetupAdmin([FromBody] SetupAdminDto dto)
    {
        var users = await _unitOfWork.Repository<User>().FindAsync(u => u.Email == dto.Email);
        var user = users.FirstOrDefault();
        if (user == null) return NotFound("User not found");

        if (!await _authService.VerifyPasswordAsync(dto.Password, user.PasswordHash))
            return Unauthorized("Invalid password");

        var hasAdmin = await _unitOfWork.Repository<User>().FindAsync(u => u.Role == UserRole.SuperAdmin || u.Role == UserRole.Admin);
        if (hasAdmin.Any() && user.Role != UserRole.SuperAdmin)
            return BadRequest("An admin already exists. Only SuperAdmin can promote users.");

        user.Role = UserRole.SuperAdmin;
        user.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<User>().UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        var token = await _authService.GenerateJwtTokenAsync(user.Id, user.Email, user.Role.ToString());
        var refreshToken = await _authService.GenerateRefreshTokenAsync(user.Id);
        return Ok(new AuthResponseDto(token, refreshToken, user.Email, user.Role.ToString(), user.Id, $"{user.FirstName} {user.LastName}"));
    }
}
