using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlayerProfileController : ControllerBase
{
    private readonly IPlayerProfileService _profileService;
    private readonly IPlayerProgressService _progressService;

    public PlayerProfileController(IPlayerProfileService profileService, IPlayerProgressService progressService)
    {
        _profileService = profileService;
        _progressService = progressService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var profile = await _profileService.GetByIdAsync(id);
        if (profile == null) return NotFound();
        return Ok(profile);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var profile = await _profileService.GetByUserIdAsync(userId);
        if (profile == null) return NotFound();
        return Ok(profile);
    }

    [HttpGet]
    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        return Ok(await _profileService.GetAllAsync(page, pageSize));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PlayerProfile profile)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        profile.UserId = userId;
        var created = await _profileService.CreateAsync(profile);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] PlayerProfile profile)
    {
        profile.Id = id;
        return Ok(await _profileService.UpdateAsync(profile));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _profileService.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("{playerId}/progress")]
    public async Task<IActionResult> GetProgress(Guid playerId)
    {
        return Ok(await _progressService.GetByPlayerAsync(playerId));
    }

    [HttpGet("{playerId}/skills")]
    public async Task<IActionResult> GetSkills(Guid playerId)
    {
        return Ok(await _progressService.GetSkillsAsync(playerId));
    }

    [HttpGet("{playerId}/achievements")]
    public async Task<IActionResult> GetAchievements(Guid playerId)
    {
        return Ok(await _profileService.GetAchievementsAsync(playerId));
    }

    [HttpPost("{playerId}/achievements/{achievementId}")]
    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    public async Task<IActionResult> AwardAchievement(Guid playerId, Guid achievementId, [FromQuery] string? notes = null)
    {
        return Ok(await _profileService.AwardAchievementAsync(playerId, achievementId, notes));
    }
}
