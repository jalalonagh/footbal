using FootballTacticalTraining.Application.DTOs.CMS;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities.CMS;

namespace FootballTacticalTraining.Infrastructure.Services;

public class TicketService : ITicketService
{
    private readonly IUnitOfWork _unitOfWork;

    public TicketService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<TicketDto>> GetUserTicketsAsync(Guid userId, int page, int pageSize)
    {
        var all = (await _unitOfWork.Repository<Ticket>().GetAllAsync())
            .Where(t => t.UserId == userId && !t.IsDeleted)
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return all.Select(MapToDto).ToList();
    }

    public async Task<List<TicketDto>> GetAllTicketsAsync(int page, int pageSize, string? status)
    {
        var query = (await _unitOfWork.Repository<Ticket>().GetAllAsync())
            .Where(t => !t.IsDeleted);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(t => t.Status == status);

        var tickets = query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return tickets.Select(MapToDto).ToList();
    }

    public async Task<TicketDto?> GetTicketByIdAsync(Guid id)
    {
        var ticket = await _unitOfWork.Repository<Ticket>().GetByIdAsync(id);
        if (ticket == null || ticket.IsDeleted) return null;
        return MapToDto(ticket);
    }

    public async Task<TicketDto> CreateTicketAsync(Guid userId, CreateTicketDto dto)
    {
        var ticket = new Ticket
        {
            UserId = userId,
            Subject = dto.Subject,
            Status = "Open",
            Priority = "Normal"
        };
        await _unitOfWork.Repository<Ticket>().AddAsync(ticket);
        await _unitOfWork.SaveChangesAsync();
        return MapToDto(ticket);
    }

    public async Task<List<TicketMessageDto>> GetTicketMessagesAsync(Guid ticketId)
    {
        var messages = (await _unitOfWork.Repository<TicketMessage>().GetAllAsync())
            .Where(m => m.TicketId == ticketId && !m.IsDeleted)
            .OrderBy(m => m.CreatedAt)
            .ToList();

        return messages.Select(MapToMessageDto).ToList();
    }

    public async Task<TicketMessageDto> AddTicketMessageAsync(Guid ticketId, Guid userId, CreateTicketMessageDto dto, bool isFromAdmin)
    {
        var message = new TicketMessage
        {
            TicketId = ticketId,
            SenderId = userId,
            Message = dto.Message,
            IsFromAdmin = isFromAdmin
        };
        await _unitOfWork.Repository<TicketMessage>().AddAsync(message);

        var ticket = await _unitOfWork.Repository<Ticket>().GetByIdAsync(ticketId);
        if (ticket != null)
        {
            ticket.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<Ticket>().UpdateAsync(ticket);
        }
        await _unitOfWork.SaveChangesAsync();
        return MapToMessageDto(message);
    }

    public async Task<TicketDto> UpdateTicketStatusAsync(Guid ticketId, string status)
    {
        var ticket = await _unitOfWork.Repository<Ticket>().GetByIdAsync(ticketId);
        if (ticket == null) throw new KeyNotFoundException("Ticket not found");

        ticket.Status = status;
        ticket.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<Ticket>().UpdateAsync(ticket);
        await _unitOfWork.SaveChangesAsync();
        return MapToDto(ticket);
    }

    private static TicketDto MapToDto(Ticket t)
    {
        return new TicketDto
        {
            Id = t.Id,
            UserId = t.UserId,
            Subject = t.Subject,
            Status = t.Status,
            Priority = t.Priority,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt,
            MessageCount = t.Messages?.Count(m => !m.IsDeleted) ?? 0
        };
    }

    private static TicketMessageDto MapToMessageDto(TicketMessage m)
    {
        return new TicketMessageDto
        {
            Id = m.Id,
            SenderId = m.SenderId,
            Message = m.Message,
            IsFromAdmin = m.IsFromAdmin,
            CreatedAt = m.CreatedAt
        };
    }
}
