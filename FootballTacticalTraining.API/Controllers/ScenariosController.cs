using FootballTacticalTraining.Application.DTOs.Scenarios;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Infrastructure.Audit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScenariosController : ControllerBase
{
    private readonly IScenarioService _scenarioService;
    private readonly IScenarioPlayerService _scenarioPlayerService;
    private readonly IScenarioSolutionService _scenarioSolutionService;
    private readonly IScenarioRuleService _scenarioRuleService;
    private readonly IAuditService _auditService;

    public ScenariosController(IScenarioService scenarioService, IScenarioPlayerService scenarioPlayerService,
        IScenarioSolutionService scenarioSolutionService, IScenarioRuleService scenarioRuleService, IAuditService auditService)
    {
        _scenarioService = scenarioService;
        _scenarioPlayerService = scenarioPlayerService;
        _scenarioSolutionService = scenarioSolutionService;
        _scenarioRuleService = scenarioRuleService;
        _auditService = auditService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetScenarios(
        [FromQuery] string? category,
        [FromQuery] string? difficulty,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        List<Scenario> scenarios;

        if (!string.IsNullOrEmpty(search))
        {
            scenarios = await _scenarioService.SearchAsync(search);
        }
        else if (!string.IsNullOrEmpty(category) && Enum.TryParse<ScenarioCategory>(category, true, out var cat))
        {
            scenarios = await _scenarioService.GetByCategoryAsync(cat);
        }
        else
        {
            scenarios = await _scenarioService.GetPublicScenariosAsync(page, pageSize);
        }

        if (!string.IsNullOrEmpty(difficulty) && Enum.TryParse<DifficultyLevel>(difficulty, true, out var diff))
        {
            scenarios = scenarios.Where(s => s.Difficulty == diff).ToList();
        }

        return Ok(scenarios.Skip((page - 1) * pageSize).Take(pageSize).Select(MapToDto));
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var scenario = await _scenarioService.GetByIdAsync(id);
        if (scenario == null) return NotFound();

        var dto = MapToDto(scenario);
        var players = await _scenarioPlayerService.GetByScenarioAsync(id);
        dto.Players = players.Select(p => new ScenarioPlayerDto
        {
            Id = p.Id, Number = p.Number, Position = p.Position.ToString(), Role = p.Role,
            StartX = p.StartX, StartY = p.StartY, TeamId = p.TeamId,
            Speed = p.Speed, HasBall = p.HasBall, IsTarget = p.IsTarget
        }).ToList();

        return Ok(dto);
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateScenarioDto dto)
    {
        if (string.IsNullOrEmpty(dto.Category) || !Enum.TryParse<ScenarioCategory>(dto.Category, true, out var cat)) cat = ScenarioCategory.Midfielder;
        if (string.IsNullOrEmpty(dto.Difficulty) || !Enum.TryParse<DifficultyLevel>(dto.Difficulty, true, out var diff)) diff = DifficultyLevel.Intermediate;
        if (string.IsNullOrEmpty(dto.GamePhase) || !Enum.TryParse<GamePhase>(dto.GamePhase, true, out var gp)) gp = GamePhase.BuildUp;
        if (string.IsNullOrEmpty(dto.TrainingMode) || !Enum.TryParse<TrainingMode>(dto.TrainingMode, true, out var tm)) tm = TrainingMode.Learn;

        var scenario = new Scenario
        {
            Name = dto.Name,
            Description = dto.Description,
            Category = cat,
            Difficulty = diff,
            Formation = dto.Formation,
            GamePhase = gp,
            GameMinute = dto.GameMinute,
            TrainingMode = tm,
            Status = ScenarioState.Draft
        };

        await _scenarioService.CreateAsync(scenario);
        await _auditService.LogAsync("CreateScenario", "Scenario", scenario.Id.ToString(), null, scenario.Name, HttpContext);
        return CreatedAtAction(nameof(GetById), new { id = scenario.Id }, MapToDto(scenario));
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateScenarioDto dto)
    {
        var scenario = await _scenarioService.GetByIdAsync(id);
        if (scenario == null) return NotFound();

        scenario.Name = dto.Name;
        scenario.Description = dto.Description;
        if (dto.Category != null && Enum.TryParse<ScenarioCategory>(dto.Category, true, out var cat)) scenario.Category = cat;
        if (dto.Difficulty != null && Enum.TryParse<DifficultyLevel>(dto.Difficulty, true, out var diff)) scenario.Difficulty = diff;
        scenario.Formation = dto.Formation ?? scenario.Formation;
        if (dto.GamePhase != null && Enum.TryParse<GamePhase>(dto.GamePhase, true, out var gp)) scenario.GamePhase = gp;
        if (dto.GameMinute.HasValue) scenario.GameMinute = dto.GameMinute.Value;

        await _scenarioService.UpdateAsync(scenario);
        return Ok(MapToDto(scenario));
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _scenarioService.DeleteAsync(id);
        return NoContent();
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPost("{id}/publish")]
    public async Task<IActionResult> Publish(Guid id)
    {
        var scenario = await _scenarioService.GetByIdAsync(id);
        if (scenario == null) return NotFound();
        scenario.Status = ScenarioState.Published;
        await _scenarioService.UpdateAsync(scenario);
        await _auditService.LogAsync("PublishScenario", "Scenario", id.ToString(), "Draft", "Published", HttpContext);
        return Ok(MapToDto(scenario));
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPost("{id}/archive")]
    public async Task<IActionResult> Archive(Guid id)
    {
        var scenario = await _scenarioService.GetByIdAsync(id);
        if (scenario == null) return NotFound();
        scenario.Status = ScenarioState.Archived;
        await _scenarioService.UpdateAsync(scenario);
        return Ok(MapToDto(scenario));
    }

    [HttpGet("{id}/players")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPlayers(Guid id)
    {
        var players = await _scenarioPlayerService.GetByScenarioAsync(id);
        return Ok(players);
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPost("{id}/players")]
    public async Task<IActionResult> AddPlayer(Guid id, [FromBody] CreateScenarioPlayerDto dto)
    {
        if (!Enum.TryParse<FootballPosition>(dto.Position, true, out var pos)) pos = FootballPosition.CM;
        var player = new ScenarioPlayer
        {
            ScenarioId = id,
            Number = dto.Number,
            Position = pos,
            Role = dto.Role,
            StartX = dto.StartX,
            StartY = dto.StartY,
            TeamId = dto.TeamId,
            Direction = dto.Direction,
            Speed = dto.Speed,
            HasBall = dto.HasBall,
            IsTarget = dto.IsTarget,
            IsDefender = dto.IsDefender
        };
        var created = await _scenarioPlayerService.CreateAsync(player);
        return Ok(created);
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPost("{id}/players/bulk")]
    public async Task<IActionResult> BulkAddPlayers(Guid id, [FromBody] List<CreateScenarioPlayerDto> dtos)
    {
        var players = dtos.Select(dto =>
        {
            if (!Enum.TryParse<FootballPosition>(dto.Position, true, out var pos)) pos = FootballPosition.CM;
            return new ScenarioPlayer
            {
                Number = dto.Number,
                Position = pos,
                Role = dto.Role,
                StartX = dto.StartX,
                StartY = dto.StartY,
                TeamId = dto.TeamId,
                Direction = dto.Direction,
                Speed = dto.Speed,
                HasBall = dto.HasBall,
                IsTarget = dto.IsTarget,
                IsDefender = dto.IsDefender
            };
        }).ToList();

        await _scenarioPlayerService.BulkCreateAsync(id, players);
        return Ok(new { message = $"Added {players.Count} players" });
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPut("players/{playerId}")]
    public async Task<IActionResult> UpdatePlayer(Guid playerId, [FromBody] CreateScenarioPlayerDto dto)
    {
        var existing = await _scenarioPlayerService.GetByIdAsync(playerId);
        if (existing == null) return NotFound();
        if (!Enum.TryParse<FootballPosition>(dto.Position, true, out var pos)) pos = FootballPosition.CM;
        existing.Number = dto.Number;
        existing.Position = pos;
        existing.Role = dto.Role;
        existing.StartX = dto.StartX;
        existing.StartY = dto.StartY;
        existing.TeamId = dto.TeamId;
        existing.Speed = dto.Speed;
        existing.HasBall = dto.HasBall;
        existing.IsTarget = dto.IsTarget;
        existing.IsDefender = dto.IsDefender;
        return Ok(await _scenarioPlayerService.UpdateAsync(existing));
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpDelete("players/{playerId}")]
    public async Task<IActionResult> DeletePlayer(Guid playerId)
    {
        await _scenarioPlayerService.DeleteAsync(playerId);
        return NoContent();
    }

    // --- ScenarioSolutions ---

    [HttpGet("{id}/solutions")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSolutions(Guid id)
    {
        return Ok(await _scenarioSolutionService.GetByScenarioAsync(id));
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPost("{id}/solutions")]
    public async Task<IActionResult> AddSolution(Guid id, [FromBody] CreateScenarioSolutionDto dto)
    {
        var solution = new ScenarioSolution
        {
            ScenarioId = id,
            SolutionType = Enum.TryParse<ScenarioSolutionType>(dto.SolutionType, true, out var st) ? st : ScenarioSolutionType.Primary,
            Name = dto.Name,
            OptimalX = dto.OptimalX,
            OptimalY = dto.OptimalY,
            Score = dto.Score,
            MovementPath = dto.MovementPath,
            CoachingExplanation = dto.CoachingExplanation
        };
        var created = await _scenarioSolutionService.CreateAsync(solution);
        return Ok(created);
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPut("solutions/{solutionId}")]
    public async Task<IActionResult> UpdateSolution(Guid solutionId, [FromBody] CreateScenarioSolutionDto dto)
    {
        var existing = await _scenarioSolutionService.GetByIdAsync(solutionId);
        if (existing == null) return NotFound();
        existing.Name = dto.Name;
        existing.OptimalX = dto.OptimalX;
        existing.OptimalY = dto.OptimalY;
        existing.Score = dto.Score;
        existing.MovementPath = dto.MovementPath;
        existing.CoachingExplanation = dto.CoachingExplanation;
        if (Enum.TryParse<ScenarioSolutionType>(dto.SolutionType, true, out var st)) existing.SolutionType = st;
        return Ok(await _scenarioSolutionService.UpdateAsync(existing));
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpDelete("solutions/{solutionId}")]
    public async Task<IActionResult> DeleteSolution(Guid solutionId)
    {
        await _scenarioSolutionService.DeleteAsync(solutionId);
        return NoContent();
    }

    // --- ScenarioRules ---

    [HttpGet("{id}/rules")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRules(Guid id)
    {
        return Ok(await _scenarioRuleService.GetByScenarioAsync(id));
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPost("{id}/rules")]
    public async Task<IActionResult> AddRule(Guid id, [FromBody] CreateScenarioRuleDto dto)
    {
        var rule = new ScenarioRule
        {
            ScenarioId = id,
            ConditionJson = dto.ConditionJson,
            ActionJson = dto.ActionJson,
            Priority = dto.Priority
        };
        var created = await _scenarioRuleService.CreateAsync(rule);
        return Ok(created);
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPut("rules/{ruleId}")]
    public async Task<IActionResult> UpdateRule(Guid ruleId, [FromBody] CreateScenarioRuleDto dto)
    {
        var existing = await _scenarioRuleService.GetByIdAsync(ruleId);
        if (existing == null) return NotFound();
        existing.ConditionJson = dto.ConditionJson;
        existing.ActionJson = dto.ActionJson;
        existing.Priority = dto.Priority;
        return Ok(await _scenarioRuleService.UpdateAsync(existing));
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpDelete("rules/{ruleId}")]
    public async Task<IActionResult> DeleteRule(Guid ruleId)
    {
        await _scenarioRuleService.DeleteAsync(ruleId);
        return NoContent();
    }

    private static ScenarioDto MapToDto(Scenario s) => new()
    {
        Id = s.Id,
        Name = s.Name,
        Description = s.Description,
        Category = s.Category,
        Difficulty = s.Difficulty,
        Formation = s.Formation,
        GamePhase = s.GamePhase,
        GameMinute = s.GameMinute,
        HomeScore = s.HomeScore,
        AwayScore = s.AwayScore,
        Status = s.Status,
        TrainingMode = s.TrainingMode,
        PlayerCount = s.Players?.Count ?? 0,
        IsPublic = s.IsPublic
    };
}
