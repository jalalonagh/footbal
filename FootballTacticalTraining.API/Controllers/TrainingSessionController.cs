using FootballTacticalTraining.Application.DTOs.Training;
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
public class TrainingSessionController : ControllerBase
{
    private readonly ITrainingSessionService _sessionService;
    private readonly IAuditService _auditService;

    public TrainingSessionController(ITrainingSessionService sessionService, IAuditService auditService)
    {
        _sessionService = sessionService;
        _auditService = auditService;
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var session = await _sessionService.GetByIdAsync(id);
        if (session == null) return NotFound();
        return Ok(session);
    }

    [Authorize]
    [HttpGet("player/{playerId}")]
    public async Task<IActionResult> GetByPlayer(Guid playerId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var sessions = await _sessionService.GetByPlayerAsync(playerId, page, pageSize);
        return Ok(sessions);
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpGet("team/{teamId}")]
    public async Task<IActionResult> GetByTeam(Guid teamId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var sessions = await _sessionService.GetByTeamAsync(teamId, page, pageSize);
        return Ok(sessions);
    }

    [Authorize]
    [HttpPost("start")]
    public async Task<IActionResult> StartSession([FromBody] StartSessionDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        if (!Enum.TryParse<TrainingMode>(dto.Mode, true, out var mode))
            return BadRequest("Invalid training mode");

        var session = await _sessionService.StartSessionAsync(userId, dto.ScenarioId, mode, dto.TeamId);
        await _auditService.LogAsync("StartSession", "TrainingSession", session.Id.ToString(), null, $"Scenario:{dto.ScenarioId}", HttpContext);
        return CreatedAtAction(nameof(GetById), new { id = session.Id }, session);
    }

    [Authorize]
    [HttpPost("{sessionId}/decision")]
    public async Task<IActionResult> RecordDecision(Guid sessionId, [FromBody] RecordDecisionDto dto)
    {
        var decision = await _sessionService.RecordDecisionAsync(
            sessionId, dto.ActionType, dto.UserX, dto.UserY,
            dto.UserTiming, dto.OptimalX, dto.OptimalY,
            dto.OptimalTiming, dto.ActionData);
        await _auditService.LogAsync("RecordDecision", "Decision", decision.Id.ToString(), null, $"Score:{decision.Score}", HttpContext);
        return Ok(decision);
    }

    [Authorize]
    [HttpPost("{sessionId}/complete")]
    public async Task<IActionResult> CompleteSession(Guid sessionId)
    {
        var session = await _sessionService.CompleteSessionAsync(sessionId);
        await _auditService.LogAsync("CompleteSession", "TrainingSession", session.Id.ToString(), null, $"Score:{session.OverallScore}", HttpContext);
        return Ok(session);
    }

    [Authorize]
    [HttpGet("{sessionId}/result")]
    public async Task<IActionResult> GetResult(Guid sessionId)
    {
        var result = await _sessionService.GetResultAsync(sessionId);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [Authorize]
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecent([FromQuery] int count = 10)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var sessions = await _sessionService.GetRecentSessionsAsync(userId, count);
        return Ok(sessions);
    }
}
