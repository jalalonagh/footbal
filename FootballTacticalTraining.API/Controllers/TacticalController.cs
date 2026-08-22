using FootballTacticalTraining.Application.DTOs.Tactical;
using FootballTacticalTraining.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TacticalController : ControllerBase
{
    private readonly ITacticalEngine _tacticalEngine;
    private readonly IEvaluationEngine _evaluationEngine;

    public TacticalController(ITacticalEngine tacticalEngine, IEvaluationEngine evaluationEngine)
    {
        _tacticalEngine = tacticalEngine;
        _evaluationEngine = evaluationEngine;
    }

    [HttpPost("analyze")]
    public async Task<ActionResult<TacticalAnalysis>> Analyze([FromBody] GameState gameState)
    {
        var analysis = await _tacticalEngine.AnalyzeSituationAsync(gameState);
        return Ok(analysis);
    }

    [HttpPost("evaluate")]
    public async Task<ActionResult<TacticalSimulationResponseDto>> Evaluate([FromBody] TacticalSimulationDto dto)
    {
        var input = new DecisionInput
        {
            UserX = dto.UserX,
            UserY = dto.UserY,
            OptimalX = dto.UserX,
            OptimalY = dto.UserY,
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
            OptimalX = dto.UserX,
            OptimalY = dto.UserY
        });
    }

    [HttpPost("recommendations")]
    public async Task<ActionResult<List<TacticalRecommendation>>> GetRecommendations(
        [FromBody] GameState gameState,
        [FromQuery] Guid playerId)
    {
        var recommendations = await _tacticalEngine.GetAllPossibleActionsAsync(gameState, playerId);
        return Ok(recommendations);
    }
}
