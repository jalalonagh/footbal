using FootballTacticalTraining.Application.DTOs.Auth;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities.Auth;
using FootballTacticalTraining.Domain.Enums;
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

    public AuthController(IAuthService authService, IUnitOfWork unitOfWork)
    {
        _authService = authService;
        _unitOfWork = unitOfWork;
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

        var token = await _authService.GenerateJwtTokenAsync(user.Id, user.Email, user.Role.ToString());
        return Ok(new AuthResponseDto(token, user.Email, user.Role.ToString(), user.Id, $"{user.FirstName} {user.LastName}"));
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

        var token = await _authService.GenerateJwtTokenAsync(user.Id, user.Email, user.Role.ToString());
        return Ok(new AuthResponseDto(token, user.Email, user.Role.ToString(), user.Id, $"{user.FirstName} {user.LastName}"));
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
        }
        return NoContent();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var users = await _unitOfWork.Repository<User>().FindAsync(u => u.Email == request.Email);
        var user = users.FirstOrDefault();
        if (user == null) return Ok(new { message = "If the email exists, a reset link has been sent." });

        var resetToken = Guid.NewGuid().ToString("N");
        user.PasswordResetToken = resetToken;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        await _unitOfWork.Repository<User>().UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "If the email exists, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var users = await _unitOfWork.Repository<User>()
            .FindAsync(u => u.PasswordResetToken == request.Token && u.Email == request.Email);
        var user = users.FirstOrDefault();
        if (user == null || user.PasswordResetTokenExpiry == null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
            return BadRequest("Invalid or expired reset token");

        user.PasswordHash = await _authService.HashPasswordAsync(request.NewPassword);
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
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user == null) return NotFound();

        if (!string.IsNullOrEmpty(request.FirstName)) user.FirstName = request.FirstName;
        if (!string.IsNullOrEmpty(request.LastName)) user.LastName = request.LastName;
        if (!string.IsNullOrEmpty(request.PhoneNumber)) user.PhoneNumber = request.PhoneNumber;
        user.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<User>().UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { user.Id, user.Email, user.FirstName, user.LastName, user.PhoneNumber });
    }
}

public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Email, string Token, string NewPassword);
public record UpdateProfileRequest(string? FirstName, string? LastName, string? PhoneNumber);
