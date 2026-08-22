using FootballTacticalTraining.Application.DTOs.Tactical;
using FootballTacticalTraining.Application.Interfaces;
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

    public TacticalController(ITacticalEngine tacticalEngine, IEvaluationEngine evaluationEngine, ISubscriptionService subscriptionService)
    {
        _tacticalEngine = tacticalEngine;
        _evaluationEngine = evaluationEngine;
        _subscriptionService = subscriptionService;
    }

    [HttpPost("analyze")]
    [Authorize]
    public async Task<ActionResult<TacticalAnalysis>> Analyze([FromBody] GameState gameState)
    {
        var analysis = await _tacticalEngine.AnalyzeSituationAsync(gameState);
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

        return Ok(new TacticalSimulationResponseDto
        {
            OverallScore = result.OverallScore,
            MistakeType = result.MistakeType,
            Explanation = result.Explanation,
            BestAlternative = result.BestAlternative,
            OptimalX = input.OptimalX,
            OptimalY = input.OptimalY
        });
    }

    [HttpPost("recommendations")]
    [Authorize]
    public async Task<ActionResult<List<TacticalRecommendation>>> GetRecommendations(
        [FromBody] GameState gameState,
        [FromQuery] Guid playerId)
    {
        var recommendations = await _tacticalEngine.GetAllPossibleActionsAsync(gameState, playerId);
        return Ok(recommendations);
    }
}
