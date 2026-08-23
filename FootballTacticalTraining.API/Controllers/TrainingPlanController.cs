using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities; using FootballTacticalTraining.Domain.Enums;
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

    public TrainingPlanController(ITrainingPlanService planService)
    {
        _planService = planService;
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
    public async Task<IActionResult> Create([FromBody] TrainingPlan plan)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        plan.CreatedByCoachId = userId;
        var created = await _planService.CreateAsync(plan);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] TrainingPlan plan)
    {
        plan.Id = id;
        var updated = await _planService.UpdateAsync(plan);
        return Ok(updated);
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
    public async Task<IActionResult> AddItem(Guid planId, [FromBody] TrainingPlanItem item)
    {
        var created = await _planService.AddItemAsync(planId, item);
        return Ok(created);
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPut("items/{itemId}")]
    public async Task<IActionResult> UpdateItem(Guid itemId, [FromBody] TrainingPlanItem item)
    {
        item.Id = itemId;
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
