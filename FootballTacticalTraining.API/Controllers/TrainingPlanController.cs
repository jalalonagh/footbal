using FootballTacticalTraining.Application.DTOs.Plans;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Infrastructure.Audit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TrainingPlanController : ControllerBase
{
    private readonly ITrainingPlanService _planService;
    private readonly IAuditService _auditService;

    public TrainingPlanController(ITrainingPlanService planService, IAuditService auditService)
    {
        _planService = planService;
        _auditService = auditService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var plan = await _planService.GetByIdAsync(id);
        if (plan == null) return NotFound();
        return Ok(plan);
    }

    [HttpGet("player/{playerId}")]
    public async Task<IActionResult> GetByPlayer(Guid playerId)
    {
        return Ok(await _planService.GetByPlayerAsync(playerId));
    }

    [HttpGet("team/{teamId}")]
    public async Task<IActionResult> GetByTeam(Guid teamId)
    {
        return Ok(await _planService.GetByTeamAsync(teamId));
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpGet("coach")]
    public async Task<IActionResult> GetByCoach()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        return Ok(await _planService.GetByCoachAsync(userId));
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTrainingPlanDto dto)
    {
        var plan = new TrainingPlan
        {
            Name = dto.Name,
            Description = dto.Description,
            PlayerProfileId = dto.PlayerProfileId,
            TeamId = dto.TeamId,
            StartDate = dto.StartDate ?? DateTime.UtcNow,
            EndDate = dto.EndDate ?? DateTime.UtcNow.AddDays(30),
            CreatedByCoachId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value)
        };
        var created = await _planService.CreateAsync(plan);
        await _auditService.LogAsync("CreatePlan", "TrainingPlan", created.Id.ToString(), null, created.Name, HttpContext);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTrainingPlanDto dto)
    {
        var plan = await _planService.GetByIdAsync(id);
        if (plan == null) return NotFound();
        plan.Name = dto.Name;
        plan.Description = dto.Description;
        if (dto.IsActive.HasValue) plan.IsActive = dto.IsActive.Value;
        return Ok(await _planService.UpdateAsync(plan));
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _planService.DeleteAsync(id);
        return NoContent();
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPost("{planId}/items")]
    public async Task<IActionResult> AddItem(Guid planId, [FromBody] AddPlanItemDto dto)
    {
        var item = new TrainingPlanItem
        {
            Title = dto.Title,
            Description = dto.Description,
            ScenarioId = dto.ScenarioId,
            Duration = dto.Duration
        };
        var created = await _planService.AddItemAsync(planId, item);
        return Ok(created);
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPut("items/{itemId}")]
    public async Task<IActionResult> UpdateItem(Guid itemId, [FromBody] AddPlanItemDto dto)
    {
        var item = new TrainingPlanItem
        {
            Id = itemId,
            Title = dto.Title,
            Description = dto.Description,
            ScenarioId = dto.ScenarioId,
            Duration = dto.Duration
        };
        var updated = await _planService.UpdateItemAsync(item);
        return Ok(updated);
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpDelete("{planId}/items/{itemId}")]
    public async Task<IActionResult> DeleteItem(Guid planId, Guid itemId)
    {
        await _planService.DeleteItemAsync(planId, itemId);
        return NoContent();
    }

    [HttpPost("{planId}/items/{itemId}/complete")]
    public async Task<IActionResult> CompleteItem(Guid planId, Guid itemId)
    {
        await _planService.CompleteItemAsync(planId, itemId);
        return Ok();
    }
}
