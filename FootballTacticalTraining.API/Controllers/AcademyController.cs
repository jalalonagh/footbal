using FootballTacticalTraining.Application.DTOs.Academies;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Infrastructure.Audit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AcademyController : ControllerBase
{
    private readonly IAcademyService _academyService;
    private readonly IAuditService _auditService;

    public AcademyController(IAcademyService academyService, IAuditService auditService)
    {
        _academyService = academyService;
        _auditService = auditService;
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
    public async Task<IActionResult> Create([FromBody] CreateAcademyDto dto)
    {
        var academy = new Academy
        {
            Name = dto.Name,
            Description = dto.Description,
            LogoUrl = dto.LogoUrl,
            ContactEmail = dto.ContactEmail,
            ContactPhone = dto.ContactPhone,
            Address = dto.Address,
            City = dto.City,
            Country = dto.Country
        };
        var created = await _academyService.CreateAsync(academy);
        await _auditService.LogAsync("CreateAcademy", "Academy", created.Id.ToString(), null, created.Name, HttpContext);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAcademyDto dto)
    {
        var existing = await _academyService.GetByIdAsync(id);
        if (existing == null) return NotFound();
        existing.Name = dto.Name;
        existing.Description = dto.Description;
        existing.LogoUrl = dto.LogoUrl;
        existing.ContactEmail = dto.ContactEmail;
        existing.ContactPhone = dto.ContactPhone;
        existing.Address = dto.Address;
        existing.City = dto.City;
        existing.Country = dto.Country;
        return Ok(await _academyService.UpdateAsync(existing));
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
