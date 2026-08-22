using FootballTacticalTraining.Application.DTOs.Scenario;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScenariosController : ControllerBase
{
    private readonly IScenarioService _scenarioService;

    public ScenariosController(IScenarioService scenarioService) { _scenarioService = scenarioService; }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<ScenarioDto>>> GetScenarios(
        [FromQuery] ScenarioCategory? category,
        [FromQuery] DifficultyLevel? difficulty,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var scenarios = category.HasValue
            ? await _scenarioService.GetByCategoryAsync(category.Value)
            : await _scenarioService.GetPublicScenariosAsync(page, pageSize);

        var dtos = scenarios.Select(s => new ScenarioDto
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
            PlayerCount = s.Players.Count,
            IsPublic = s.IsPublic
        }).ToList();

        return Ok(new { items = dtos, total = dtos.Count, page, pageSize });
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<ScenarioDto>> GetById(Guid id)
    {
        var scenario = await _scenarioService.GetByIdAsync(id);
        if (scenario == null) return NotFound();

        return Ok(new ScenarioDto
        {
            Id = scenario.Id,
            Name = scenario.Name,
            Description = scenario.Description,
            Category = scenario.Category,
            Difficulty = scenario.Difficulty,
            Formation = scenario.Formation,
            GamePhase = scenario.GamePhase,
            GameMinute = scenario.GameMinute,
            HomeScore = scenario.HomeScore,
            AwayScore = scenario.AwayScore,
            Status = scenario.Status,
            TrainingMode = scenario.TrainingMode,
            PlayerCount = scenario.Players.Count,
            IsPublic = scenario.IsPublic
        });
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPost]
    public async Task<ActionResult<ScenarioDto>> Create([FromBody] ScenarioDto dto)
    {
        var scenario = new Domain.Entities.Scenario
        {
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            Difficulty = dto.Difficulty,
            Formation = dto.Formation,
            GamePhase = dto.GamePhase,
            GameMinute = dto.GameMinute,
            HomeScore = dto.HomeScore,
            AwayScore = dto.AwayScore,
            Status = ScenarioState.Draft,
            TrainingMode = dto.TrainingMode,
            IsPublic = dto.IsPublic
        };

        await _scenarioService.CreateAsync(scenario);
        dto.Id = scenario.Id;
        return CreatedAtAction(nameof(GetById), new { id = scenario.Id }, dto);
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ScenarioDto dto)
    {
        var scenario = await _scenarioService.GetByIdAsync(id);
        if (scenario == null) return NotFound();

        scenario.Name = dto.Name;
        scenario.Description = dto.Description;
        scenario.Category = dto.Category;
        scenario.Difficulty = dto.Difficulty;
        scenario.Formation = dto.Formation;
        scenario.GamePhase = dto.GamePhase;
        scenario.GameMinute = dto.GameMinute;
        await _scenarioService.UpdateAsync(scenario);
        return NoContent();
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _scenarioService.DeleteAsync(id);
        return NoContent();
    }
}
