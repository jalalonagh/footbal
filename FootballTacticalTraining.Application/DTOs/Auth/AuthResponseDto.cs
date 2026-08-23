using System.ComponentModel.DataAnnotations;

namespace FootballTacticalTraining.Application.DTOs.Auth;

public record AuthResponseDto(string Token, string RefreshToken, string Email, string Role, Guid UserId, string? FullName);

public class RefreshTokenDto
{
    [Required(ErrorMessage = "Refresh token is required")]
    public string RefreshToken { get; set; } = string.Empty;
}
