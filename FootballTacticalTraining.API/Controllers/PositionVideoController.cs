using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PositionVideoController : ControllerBase
{
    private readonly IPositionVideoService _videoService;
    private readonly IWebHostEnvironment _env;

    public PositionVideoController(IPositionVideoService videoService, IWebHostEnvironment env)
    {
        _videoService = videoService;
        _env = env;
    }

    [HttpGet("position/{positionId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByPositionId(Guid positionId)
    {
        var videos = await _videoService.GetByPositionIdAsync(positionId);
        return Ok(videos);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var video = await _videoService.GetByIdAsync(id);
        if (video == null) return NotFound();
        return Ok(video);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PositionVideo video)
    {
        var created = await _videoService.CreateAsync(video);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] PositionVideo video)
    {
        if (id != video.Id) return BadRequest();
        var updated = await _videoService.UpdateAsync(video);
        return Ok(updated);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _videoService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        var allowedExtensions = new[] { ".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest("Invalid file type. Allowed: mp4, webm, ogg, mov, avi, mkv");

        var maxSize = 100 * 1024 * 1024; // 100MB
        if (file.Length > maxSize)
            return BadRequest("File too large. Max 100MB");

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var uploadsDir = Path.Combine(webRoot, "uploads", "videos");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var url = $"/uploads/videos/{fileName}";
        return Ok(new { url, fileName });
    }
}
