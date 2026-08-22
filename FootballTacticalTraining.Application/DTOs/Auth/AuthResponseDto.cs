namespace FootballTacticalTraining.Application.DTOs.Auth;

public record AuthResponseDto(string Token, string Email, string Role, Guid UserId, string? FullName);