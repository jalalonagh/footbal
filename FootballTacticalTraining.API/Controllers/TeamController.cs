using FootballTacticalTraining.Application.DTOs.Teams;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Infrastructure.Audit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeamController : ControllerBase
{
    private readonly ITeamService _teamService;
    private readonly IAuditService _auditService;

    public TeamController(ITeamService teamService, IAuditService auditService)
    {
        _teamService = teamService;
        _auditService = auditService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var team = await _teamService.GetByIdAsync(id);
        if (team == null) return NotFound();
        return Ok(team);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        return Ok(await _teamService.GetAllAsync(page, pageSize));
    }

    [HttpGet("coach/{coachId}")]
    public async Task<IActionResult> GetByCoach(Guid coachId)
    {
        return Ok(await _teamService.GetByCoachAsync(coachId));
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeamDto dto)
    {
        var team = new Team
        {
            Name = dto.Name,
            Description = dto.Description,
            Formation = dto.Formation,
            CoachProfileId = dto.CoachProfileId,
            AcademyId = dto.AcademyId
        };
        var created = await _teamService.CreateAsync(team);
        await _auditService.LogAsync("CreateTeam", "Team", created.Id.ToString(), null, created.Name, HttpContext);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTeamDto dto)
    {
        var existing = await _teamService.GetByIdAsync(id);
        if (existing == null) return NotFound();

        existing.Name = dto.Name;
        existing.Description = dto.Description;
        existing.Formation = dto.Formation;
        return Ok(await _teamService.UpdateAsync(existing));
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _teamService.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("{teamId}/roster")]
    public async Task<IActionResult> GetRoster(Guid teamId)
    {
        return Ok(await _teamService.GetRosterAsync(teamId));
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPost("{teamId}/players")]
    public async Task<IActionResult> AddPlayer(Guid teamId, [FromBody] AddPlayerToTeamDto dto)
    {
        await _teamService.AddPlayerAsync(teamId, dto.PlayerProfileId, dto.Position, dto.ShirtNumber);
        return Ok();
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpDelete("{teamId}/players/{playerId}")]
    public async Task<IActionResult> RemovePlayer(Guid teamId, Guid playerId)
    {
        await _teamService.RemovePlayerAsync(teamId, playerId);
        return NoContent();
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPut("{teamId}/players/{playerId}")]
    public async Task<IActionResult> UpdatePlayerRole(Guid teamId, Guid playerId, [FromBody] AddPlayerToTeamDto dto)
    {
        await _teamService.UpdatePlayerRoleAsync(teamId, playerId, dto.Position, dto.ShirtNumber);
        return Ok();
    }
}
