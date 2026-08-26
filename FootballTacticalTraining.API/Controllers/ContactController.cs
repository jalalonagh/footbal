using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FootballTacticalTraining.Application.DTOs.CMS;
using FootballTacticalTraining.Application.Interfaces;

namespace FootballTacticalTraining.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ContactController : ControllerBase
{
    private readonly IContactService _contactService;

    public ContactController(IContactService contactService)
    {
        _contactService = contactService;
    }

    [HttpGet("settings")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _contactService.GetContactSettingsAsync();
        return Ok(settings);
    }

    [HttpPut("settings")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> UpdateSettings([FromBody] ContactSettingDto dto)
    {
        var result = await _contactService.UpdateContactSettingsAsync(dto);
        return Ok(result);
    }
}
