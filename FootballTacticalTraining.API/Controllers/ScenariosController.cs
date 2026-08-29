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
    private readonly ISubscriptionService _subscriptionService;

    public ScenariosController(IScenarioService scenarioService, IScenarioPlayerService scenarioPlayerService,
        IScenarioSolutionService scenarioSolutionService, IScenarioRuleService scenarioRuleService, IAuditService auditService,
        ISubscriptionService subscriptionService)
    {
        _scenarioService = scenarioService;
        _scenarioPlayerService = scenarioPlayerService;
        _scenarioSolutionService = scenarioSolutionService;
        _scenarioRuleService = scenarioRuleService;
        _auditService = auditService;
        _subscriptionService = subscriptionService;
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

    [HttpGet("demo")]
    [AllowAnonymous]
    public IActionResult GetDemo()
    {
        return Ok(new
        {
            id = Guid.NewGuid().ToString(),
            name = "Demo Scenario",
            description = "A demo scenario for testing",
            category = "Midfielder",
            difficulty = "Intermediate",
            formation = "4-4-2",
            gamePhase = "Attack",
            gameMinute = 35,
            trainingMode = "Tactical",
            homeScore = 1,
            awayScore = 0,
            status = "Published"
        });
    }

    [HttpGet("recent")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRecent([FromQuery] int count = 3)
    {
        var all = await _scenarioService.GetPublicScenariosAsync(1, 100);
        var recent = all.OrderByDescending(s => s.UpdatedAt ?? s.CreatedAt).Take(count).ToList();

        var result = new List<object>();
        foreach (var s in recent)
        {
            var players = await _scenarioPlayerService.GetByScenarioAsync(s.Id);
            result.Add(new
            {
                s.Id, s.Name, s.Description,
                Category = s.Category.ToString(),
                Difficulty = s.Difficulty.ToString(),
                s.Formation,
                GamePhase = s.GamePhase.ToString(),
                s.GameMinute,
                Players = players.Select(p => new
                {
                    p.Id, p.Number, Position = p.Position.ToString(), p.Role,
                    p.StartX, p.StartY, p.TeamId,
                    p.Speed, p.HasBall, p.IsTarget
                })
            });
        }
        return Ok(result);
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
    [HttpDelete("rules/{ruleId}")]
    public async Task<IActionResult> DeleteRule(Guid ruleId)
    {
        await _scenarioRuleService.DeleteAsync(ruleId);
        return NoContent();
    }

    // --- Admin: Manage all scenarios ---

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAllForAdmin(
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var scenarios = await _scenarioService.GetAllForAdminAsync(status, search, page, pageSize);
        var total = await _scenarioService.GetAdminCountAsync(status, search);

        var result = new List<object>();
        foreach (var s in scenarios)
        {
            var players = await _scenarioPlayerService.GetByScenarioAsync(s.Id);
            result.Add(new
            {
                s.Id, s.Name, s.Description,
                Category = s.Category.ToString(),
                Difficulty = s.Difficulty.ToString(),
                s.Formation,
                GamePhase = s.GamePhase.ToString(),
                s.GameMinute,
                s.HomeScore,
                s.AwayScore,
                Status = s.Status.ToString(),
                TrainingMode = s.TrainingMode.ToString(),
                s.ImageUrl,
                s.CreatedByCoachId,
                s.CreatedAt,
                s.UpdatedAt,
                PlayerCount = players.Count
            });
        }
        return Ok(new { scenarios = result, total, page, pageSize });
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost("admin/{id}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var scenario = await _scenarioService.GetByIdAsync(id);
        if (scenario == null) return NotFound();
        scenario.Status = ScenarioState.Published;
        scenario.IsPublic = true;
        await _scenarioService.UpdateAsync(scenario);
        await _auditService.LogAsync("ApproveScenario", "Scenario", id.ToString(), scenario.Status.ToString(), "Published", HttpContext);
        return Ok(MapToDto(scenario));
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost("admin/{id}/reject")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var scenario = await _scenarioService.GetByIdAsync(id);
        if (scenario == null) return NotFound();
        scenario.Status = ScenarioState.Archived;
        scenario.IsPublic = false;
        await _scenarioService.UpdateAsync(scenario);
        await _auditService.LogAsync("RejectScenario", "Scenario", id.ToString(), scenario.Status.ToString(), "Archived", HttpContext);
        return Ok(MapToDto(scenario));
    }

    // --- User: Create scenario from image ---

    [Authorize]
    [HttpPost("from-image")]
    public async Task<IActionResult> CreateFromImage([FromBody] CreateFromImageDto dto)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var hasAccess = await _subscriptionService.HasFeatureAccessAsync(Guid.Parse(userId), "AI_Coach");
        if (!hasAccess) return Forbid();

        if (string.IsNullOrEmpty(dto.Category) || !Enum.TryParse<ScenarioCategory>(dto.Category, true, out var cat)) cat = ScenarioCategory.Team;
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
            HomeScore = dto.HomeScore,
            AwayScore = dto.AwayScore,
            TrainingMode = tm,
            Status = ScenarioState.Draft,
            IsPublic = false,
            ImageUrl = dto.ImageUrl,
            CreatedByCoachId = Guid.Parse(userId)
        };

        await _scenarioService.CreateAsync(scenario);

        // Save source image to disk if provided
        if (!string.IsNullOrEmpty(dto.SourceImageBase64))
        {
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "scenario-images");
            Directory.CreateDirectory(uploadsDir);
            var fileName = $"{scenario.Id}.jpg";
            var filePath = Path.Combine(uploadsDir, fileName);
            try
            {
                var imageBytes = Convert.FromBase64String(dto.SourceImageBase64);
                await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);
                scenario.ImageUrl = $"/uploads/scenario-images/{fileName}";
                await _scenarioService.UpdateAsync(scenario);
            }
            catch { }
        }

        // Save AI-detected players
        if (dto.Players != null && dto.Players.Count > 0)
        {
            var players = dto.Players.Select(p =>
            {
                if (!Enum.TryParse<FootballPosition>(p.Position, true, out var pos)) pos = FootballPosition.CM;
                return new ScenarioPlayer
                {
                    ScenarioId = scenario.Id,
                    Number = p.Number,
                    Position = pos,
                    StartX = (decimal)p.X,
                    StartY = (decimal)p.Y,
                    TeamId = p.TeamId,
                    HasBall = p.HasBall,
                    Role = p.Description
                };
            }).ToList();

            await _scenarioPlayerService.BulkCreateAsync(scenario.Id, players);
        }

        await _auditService.LogAsync("CreateFromImage", "Scenario", scenario.Id.ToString(), null, scenario.Name, HttpContext);
        return CreatedAtAction(nameof(GetById), new { id = scenario.Id }, MapToDto(scenario));
    }

    private string? GetUserId()
    {
        var sub = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (!string.IsNullOrEmpty(sub)) return sub;
        return User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
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

public class CreateFromImageDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Difficulty { get; set; }
    public string? Formation { get; set; }
    public string? GamePhase { get; set; }
    public int GameMinute { get; set; }
    public int HomeScore { get; set; }
    public int AwayScore { get; set; }
    public string? TrainingMode { get; set; }
    public string? ImageUrl { get; set; }
    public string? SourceImageBase64 { get; set; }
    public List<ImagePlayerDto>? Players { get; set; }
}

public class ImagePlayerDto
{
    public int Number { get; set; }
    public string Position { get; set; } = "";
    public double X { get; set; }
    public double Y { get; set; }
    public int TeamId { get; set; }
    public bool HasBall { get; set; }
    public string Description { get; set; } = "";
}
