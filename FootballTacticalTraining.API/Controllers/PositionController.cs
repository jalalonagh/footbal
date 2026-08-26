using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PositionController : ControllerBase
{
    private readonly IPositionService _positionService;

    public PositionController(IPositionService positionService)
    {
        _positionService = positionService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false)
    {
        var positions = await _positionService.GetAllPositionsAsync(includeInactive);
        return Ok(positions);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var position = await _positionService.GetPositionByIdAsync(id);
        if (position == null) return NotFound();
        return Ok(position);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Position position)
    {
        var created = await _positionService.CreatePositionAsync(position);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Position position)
    {
        if (id != position.Id) return BadRequest();
        var updated = await _positionService.UpdatePositionAsync(position);
        return Ok(updated);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _positionService.DeletePositionAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [Authorize]
    [HttpGet("my-position")]
    public async Task<IActionResult> GetMyPosition()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var myPosition = await _positionService.GetMyPositionAsync(userId.Value);
        return Ok(myPosition);
    }

    [Authorize]
    [HttpPost("select")]
    public async Task<IActionResult> SelectPosition([FromBody] SelectPositionRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var userPosition = await _positionService.SelectPositionAsync(userId.Value, request.PositionId);
        return Ok(userPosition);
    }

    [Authorize]
    [HttpDelete("my-position")]
    public async Task<IActionResult> RemoveMyPosition()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var removed = await _positionService.RemoveUserPositionAsync(userId.Value);
        if (!removed) return NotFound();
        return NoContent();
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpGet("all-user-positions")]
    public async Task<IActionResult> GetAllUserPositions()
    {
        var userPositions = await _positionService.GetAllUserPositionsAsync();
        return Ok(userPositions);
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return null;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}

public class SelectPositionRequest
{
    public Guid PositionId { get; set; }
}
