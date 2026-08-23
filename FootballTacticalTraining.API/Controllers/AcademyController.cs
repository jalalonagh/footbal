using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities; using FootballTacticalTraining.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AcademyController : ControllerBase
{
    private readonly IAcademyService _academyService;

    public AcademyController(IAcademyService academyService)
    {
        _academyService = academyService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var academy = await _academyService.GetByIdAsync(id);
        if (academy == null) return NotFound();
        return Ok(academy);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        return Ok(await _academyService.GetAllAsync(page, pageSize));
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Academy academy)
    {
        var created = await _academyService.CreateAsync(academy);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Academy academy)
    {
        academy.Id = id;
        return Ok(await _academyService.UpdateAsync(academy));
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _academyService.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("{academyId}/teams")]
    public async Task<IActionResult> GetTeams(Guid academyId)
    {
        return Ok(await _academyService.GetTeamsAsync(academyId));
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost("{academyId}/teams/{teamId}")]
    public async Task<IActionResult> AddTeam(Guid academyId, Guid teamId)
    {
        await _academyService.AddTeamAsync(academyId, teamId);
        return Ok();
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("{academyId}/teams/{teamId}")]
    public async Task<IActionResult> RemoveTeam(Guid academyId, Guid teamId)
    {
        await _academyService.RemoveTeamAsync(academyId, teamId);
        return NoContent();
    }
}
