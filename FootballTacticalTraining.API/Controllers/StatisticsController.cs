using FootballTacticalTraining.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatisticsController : ControllerBase
{
    private readonly IStatisticsService _statisticsService;

    public StatisticsController(IStatisticsService statisticsService)
    {
        _statisticsService = statisticsService;
    }

    [HttpGet("player/{playerId}")]
    public async Task<IActionResult> GetPlayerStats(Guid playerId)
    {
        return Ok(await _statisticsService.GetPlayerStatsAsync(playerId));
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyStats()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        return Ok(await _statisticsService.GetPlayerStatsAsync(userId));
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpGet("coach")]
    public async Task<IActionResult> GetCoachStats()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        return Ok(await _statisticsService.GetCoachStatsAsync(userId));
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpGet("admin")]
    public async Task<IActionResult> GetAdminStats()
    {
        return Ok(await _statisticsService.GetAdminStatsAsync());
    }

    [HttpGet("rankings")]
    public async Task<IActionResult> GetTopPlayers([FromQuery] int count = 10)
    {
        return Ok(await _statisticsService.GetTopPlayersAsync(count));
    }

    [HttpGet("player/{playerId}/trends")]
    public async Task<IActionResult> GetSkillTrends(Guid playerId, [FromQuery] int days = 30)
    {
        return Ok(await _statisticsService.GetSkillTrendsAsync(playerId, days));
    }
}
