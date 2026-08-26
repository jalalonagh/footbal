using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FootballTacticalTraining.Application.DTOs.CMS;
using FootballTacticalTraining.Application.Interfaces;

namespace FootballTacticalTraining.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TicketController : ControllerBase
{
    private readonly ITicketService _ticketService;

    private Guid GetCurrentUserId()
    {
        var value = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(value, out var id) ? id : Guid.Empty;
    }

    public TicketController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyTickets([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var tickets = await _ticketService.GetUserTicketsAsync(GetCurrentUserId(), page, pageSize);
        return Ok(tickets);
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetAllTickets([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? status = null)
    {
        var tickets = await _ticketService.GetAllTicketsAsync(page, pageSize, status);
        return Ok(tickets);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTicket(Guid id)
    {
        var ticket = await _ticketService.GetTicketByIdAsync(id);
        if (ticket == null) return NotFound();
        if (ticket.UserId != GetCurrentUserId() && !User.IsInRole("Admin") && !User.IsInRole("SuperAdmin"))
            return Forbid();
        return Ok(ticket);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTicket([FromBody] CreateTicketDto dto)
    {
        var ticket = await _ticketService.CreateTicketAsync(GetCurrentUserId(), dto);
        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
    }

    [HttpGet("{id}/messages")]
    public async Task<IActionResult> GetMessages(Guid id)
    {
        var ticket = await _ticketService.GetTicketByIdAsync(id);
        if (ticket == null) return NotFound();
        if (ticket.UserId != GetCurrentUserId() && !User.IsInRole("Admin") && !User.IsInRole("SuperAdmin"))
            return Forbid();

        var messages = await _ticketService.GetTicketMessagesAsync(id);
        return Ok(messages);
    }

    [HttpPost("{id}/messages")]
    public async Task<IActionResult> AddMessage(Guid id, [FromBody] CreateTicketMessageDto dto)
    {
        var ticket = await _ticketService.GetTicketByIdAsync(id);
        if (ticket == null) return NotFound();
        if (ticket.UserId != GetCurrentUserId() && !User.IsInRole("Admin") && !User.IsInRole("SuperAdmin"))
            return Forbid();

        bool isFromAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");
        var message = await _ticketService.AddTicketMessageAsync(id, GetCurrentUserId(), dto, isFromAdmin);
        return Ok(message);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTicketStatusDto dto)
    {
        var ticket = await _ticketService.UpdateTicketStatusAsync(id, dto.Status);
        return Ok(ticket);
    }
}
