using FootballTacticalTraining.Application.DTOs.Tactical;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Infrastructure.Audit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TacticalController : ControllerBase
{
    private readonly ITacticalEngine _tacticalEngine;
    private readonly IEvaluationEngine _evaluationEngine;
    private readonly ISubscriptionService _subscriptionService;
    private readonly IAuditService _auditService;
    private readonly IEmailService _emailService;

    public TacticalController(ITacticalEngine tacticalEngine, IEvaluationEngine evaluationEngine, ISubscriptionService subscriptionService, IAuditService auditService, IEmailService emailService)
    {
        _tacticalEngine = tacticalEngine;
        _evaluationEngine = evaluationEngine;
        _subscriptionService = subscriptionService;
        _auditService = auditService;
        _emailService = emailService;
    }

    [HttpPost("analyze")]
    [Authorize]
    public async Task<ActionResult<TacticalAnalysis>> Analyze([FromBody] GameState gameState)
    {
        var analysis = await _tacticalEngine.AnalyzeSituationAsync(gameState);
        await _auditService.LogAsync("Analyze", "Tactical", gameState.BallX.ToString(), newValue: analysis.DefensiveLineHeight, context: HttpContext);
        return Ok(analysis);
    }

    [HttpPost("evaluate")]
    [Authorize]
    public async Task<ActionResult<TacticalSimulationResponseDto>> Evaluate([FromBody] TacticalSimulationDto dto)
    {
        var analysis = await _tacticalEngine.AnalyzeSituationAsync(new GameState
        {
            BallX = dto.UserX,
            BallY = dto.UserY,
            Players = new List<PlayerState>()
        });

        var input = new DecisionInput
        {
            UserX = dto.UserX,
            UserY = dto.UserY,
            OptimalX = 100 - analysis.DistanceToGoal > 30 ? dto.UserX + 5 : dto.UserX - 3,
            OptimalY = analysis.DefensiveLineHeight == "HIGH" ? dto.UserY - 8 : dto.UserY + 5,
            UserTiming = dto.Timing,
            OptimalTiming = 1.5m,
            ActionType = dto.ActionType
        };

        var result = await _evaluationEngine.EvaluateDecisionAsync(input);

        var response = new TacticalSimulationResponseDto
        {
            OverallScore = result.OverallScore,
            MistakeType = result.MistakeType,
            Explanation = result.Explanation,
            BestAlternative = result.BestAlternative,
            OptimalX = input.OptimalX,
            OptimalY = input.OptimalY
        };

        await _auditService.LogAsync("Evaluate", "Tactical", dto.ActionType, newValue: result.OverallScore.ToString(), context: HttpContext);

        return Ok(response);
    }

    [HttpPost("recommendations")]
    [Authorize]
    public async Task<ActionResult<List<TacticalRecommendation>>> GetRecommendations(
        [FromBody] GameState gameState,
        [FromQuery] Guid playerId)
    {
        var recommendations = await _tacticalEngine.GetAllPossibleActionsAsync(gameState, playerId);
        await _auditService.LogAsync("GetRecommendations", "Tactical", playerId.ToString(), newValue: gameState.BallX.ToString(), context: HttpContext);
        return Ok(recommendations);
    }
}
