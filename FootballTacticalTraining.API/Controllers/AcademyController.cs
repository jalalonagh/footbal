using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FootballTacticalTraining.Application.DTOs.Academies;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Infrastructure.Audit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AcademyController : ControllerBase
{
    private readonly IAcademyService _academyService;
    private readonly IAuditService _auditService;

    public AcademyController(IAcademyService academyService, IAuditService auditService)
    {
        _academyService = academyService;
        _auditService = auditService;
    }

    // ─── Public: Browse approved academies ─────────────

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetApproved(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? city = null,
        [FromQuery] string? province = null)
    {
        var academies = await _academyService.GetApprovedAcademiesAsync(page, pageSize, search, city, province);
        var total = await _academyService.GetApprovedCountAsync(search, city, province);
        return Ok(new { academies, total, page, pageSize });
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var academy = await _academyService.GetByIdAsync(id);
        if (academy == null) return NotFound();
        if (academy.Status != AcademyStatus.Approved && !User.IsInRole("Admin") && !User.IsInRole("SuperAdmin"))
            return NotFound();
        return Ok(academy);
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyAcademy()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var db = _academyService.GetType().GetField("_unitOfWork", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        // Fallback: search by CreatedById
        var all = await _academyService.GetAllForAdminAsync(null, null, 1, 1000);
        var mine = all.Where(a => a.CreatedById?.ToString() == userId).ToList();
        return Ok(mine);
    }

    // ─── User: Submit new academy ─────────────────────

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateAcademyDto dto)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var academy = new Academy
        {
            Name = dto.Name,
            Description = dto.Description,
            LogoUrl = dto.LogoUrl,
            ContactEmail = dto.ContactEmail,
            ContactPhone = dto.ContactPhone,
            Address = dto.Address,
            City = dto.City,
            Province = dto.Province,
            Country = dto.Country ?? "Iran",
            Website = dto.Website,
            Instagram = dto.Instagram,
            Telegram = dto.Telegram,
            FoundedYear = dto.FoundedYear,
            AgeGroups = dto.AgeGroups,
            PlayingStyle = dto.PlayingStyle,
            Facilities = dto.Facilities,
            MinAge = dto.MinAge,
            MaxAge = dto.MaxAge,
            MonthlyFee = dto.MonthlyFee,
            Status = User.IsInRole("Admin") || User.IsInRole("SuperAdmin") ? AcademyStatus.Approved : AcademyStatus.Pending,
            CreatedById = Guid.Parse(userId),
            CreatedBy = userId
        };

        var created = await _academyService.CreateAsync(academy);
        await _auditService.LogAsync("CreateAcademy", "Academy", created.Id.ToString(), null, created.Name, HttpContext);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // ─── User: Edit own academy (before approval) ─────

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAcademyDto dto)
    {
        var existing = await _academyService.GetByIdAsync(id);
        if (existing == null) return NotFound();

        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");

        if (!isAdmin && existing.CreatedById?.ToString() != userId)
            return Forbid();

        if (!isAdmin && existing.Status == AcademyStatus.Approved)
            return BadRequest(new { message = "Cannot edit an approved academy" });

        existing.Name = dto.Name;
        existing.Description = dto.Description;
        existing.LogoUrl = dto.LogoUrl;
        existing.ContactEmail = dto.ContactEmail;
        existing.ContactPhone = dto.ContactPhone;
        existing.Address = dto.Address;
        existing.City = dto.City;
        existing.Province = dto.Province;
        existing.Country = dto.Country;
        existing.Website = dto.Website;
        existing.Instagram = dto.Instagram;
        existing.Telegram = dto.Telegram;
        existing.FoundedYear = dto.FoundedYear;
        existing.AgeGroups = dto.AgeGroups;
        existing.PlayingStyle = dto.PlayingStyle;
        existing.Facilities = dto.Facilities;
        existing.MinAge = dto.MinAge;
        existing.MaxAge = dto.MaxAge;
        existing.MonthlyFee = dto.MonthlyFee;

        if (isAdmin)
        {
            if (dto.IsActive.HasValue) existing.IsActive = dto.IsActive.Value;
            if (dto.AdminNotes != null) existing.AdminNotes = dto.AdminNotes;
        }

        await _academyService.UpdateAsync(existing);
        await _auditService.LogAsync("UpdateAcademy", "Academy", id.ToString(), null, existing.Name, HttpContext);
        return Ok(existing);
    }

    // ─── Admin: Manage all academies ──────────────────

    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetAllForAdmin(
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var academies = await _academyService.GetAllForAdminAsync(status, search, page, pageSize);
        var total = await _academyService.GetAdminCountAsync(status, search);
        return Ok(new { academies, total, page, pageSize });
    }

    [HttpPost("admin/{id}/approve")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] AdminNotesDto? dto = null)
    {
        var academy = await _academyService.GetByIdAsync(id);
        if (academy == null) return NotFound();
        academy.Status = AcademyStatus.Approved;
        academy.AdminNotes = dto?.Notes;
        await _academyService.UpdateAsync(academy);
        await _auditService.LogAsync("ApproveAcademy", "Academy", id.ToString(), academy.Status.ToString(), "Approved", HttpContext);
        return Ok(academy);
    }

    [HttpPost("admin/{id}/reject")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] AdminNotesDto? dto = null)
    {
        var academy = await _academyService.GetByIdAsync(id);
        if (academy == null) return NotFound();
        academy.Status = AcademyStatus.Rejected;
        academy.RejectionReason = dto?.Notes;
        academy.AdminNotes = dto?.Notes;
        await _academyService.UpdateAsync(academy);
        await _auditService.LogAsync("RejectAcademy", "Academy", id.ToString(), academy.Status.ToString(), "Rejected", HttpContext);
        return Ok(academy);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _academyService.DeleteAsync(id);
        await _auditService.LogAsync("DeleteAcademy", "Academy", id.ToString(), null, null, HttpContext);
        return NoContent();
    }

    // ─── Teams ────────────────────────────────────────

    [HttpGet("{academyId}/teams")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTeams(Guid academyId)
    {
        return Ok(await _academyService.GetTeamsAsync(academyId));
    }

    [HttpPost("{academyId}/teams/{teamId}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> AddTeam(Guid academyId, Guid teamId)
    {
        await _academyService.AddTeamAsync(academyId, teamId);
        return Ok();
    }

    [HttpDelete("{academyId}/teams/{teamId}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> RemoveTeam(Guid academyId, Guid teamId)
    {
        await _academyService.RemoveTeamAsync(academyId, teamId);
        return NoContent();
    }

    private string? GetUserId()
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (!string.IsNullOrEmpty(sub)) return sub;
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}

public class AdminNotesDto
{
    public string? Notes { get; set; }
}
