using FootballTacticalTraining.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin")]
public class AiLogsController : ControllerBase
{
    private readonly AiLogService _logService;

    public AiLogsController(AiLogService logService)
    {
        _logService = logService;
    }

    [HttpGet]
    public async Task<IActionResult> GetLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? search = null,
        [FromQuery] string? endpoint = null,
        [FromQuery] Guid? userId = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        var logs = await _logService.GetLogsAsync(page, pageSize, search, endpoint, userId, from, to);
        var total = await _logService.GetCountAsync(search, endpoint, userId, from, to);
        return Ok(new { logs, total, page, pageSize });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var log = await _logService.GetByIdAsync(id);
        if (log == null) return NotFound();
        return Ok(log);
    }
}
