using FootballTacticalTraining.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AIController : ControllerBase
{
    private readonly IAIService _aiService;
    private readonly ISubscriptionService _subscriptionService;

    public AIController(IAIService aiService, ISubscriptionService subscriptionService)
    {
        _aiService = aiService;
        _subscriptionService = subscriptionService;
    }

    [HttpPost("chat")]
    [Authorize]
    public async Task<ActionResult<string>> Chat([FromBody] ChatRequest request)
    {
        var response = await _aiService.ChatAsync(request.SystemPrompt, request.UserMessage, request.Temperature, request.MaxTokens);
        return Ok(response);
    }

    [HttpPost("analyze-tactical")]
    [Authorize]
    public async Task<ActionResult<string>> AnalyzeTactical([FromBody] TacticalAnalysisRequest request)
    {
        var response = await _aiService.AnalyzeTacticalAsync(request.Scenario, request.Players);
        return Ok(response);
    }

    [HttpPost("generate-training-plan")]
    [Authorize]
    public async Task<ActionResult<string>> GenerateTrainingPlan([FromBody] TrainingPlanRequest request)
    {
        var response = await _aiService.GenerateTrainingPlanAsync(request.PlayerLevel, request.FocusArea);
        return Ok(response);
    }

    [HttpPost("evaluate-performance")]
    [Authorize]
    public async Task<ActionResult<string>> EvaluatePerformance([FromBody] PerformanceRequest request)
    {
        var response = await _aiService.EvaluatePerformanceAsync(request.Stats);
        return Ok(response);
    }

    [HttpPost("tactical-suggestion")]
    [Authorize]
    public async Task<ActionResult<AISuggestionResponse>> GetTacticalSuggestion([FromBody] AITacticalSuggestionRequest request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var hasAccess = await _subscriptionService.HasFeatureAccessAsync(Guid.Parse(userId), "AI_Coach");
        if (!hasAccess)
            return Forbid();

        var response = await _aiService.GetTacticalSuggestionAsync(request);
        return Ok(response);
    }

    [HttpPost("check-ai-access")]
    [Authorize]
    public async Task<ActionResult<bool>> CheckAIAccess()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Ok(false);

        var hasAccess = await _subscriptionService.HasFeatureAccessAsync(Guid.Parse(userId), "AI_Coach");
        return Ok(hasAccess);
    }

    private string? GetUserId()
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (!string.IsNullOrEmpty(sub)) return sub;
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}

public class ChatRequest
{
    public string SystemPrompt { get; set; } = "";
    public string UserMessage { get; set; } = "";
    public decimal Temperature { get; set; } = 0.7m;
    public int MaxTokens { get; set; } = 2048;
}

public class TacticalAnalysisRequest
{
    public string Scenario { get; set; } = "";
    public string Players { get; set; } = "";
}

public class TrainingPlanRequest
{
    public string PlayerLevel { get; set; } = "";
    public string FocusArea { get; set; } = "";
}

public class PerformanceRequest
{
    public string Stats { get; set; } = "";
}
