using FootballTacticalTraining.Application.DTOs.CMS;

namespace FootballTacticalTraining.Application.Interfaces;

public interface IContactService
{
    Task<ContactSettingDto?> GetContactSettingsAsync();
    Task<ContactSettingDto> UpdateContactSettingsAsync(ContactSettingDto dto);
}

public interface ITicketService
{
    Task<List<TicketDto>> GetUserTicketsAsync(Guid userId, int page, int pageSize);
    Task<List<TicketDto>> GetAllTicketsAsync(int page, int pageSize, string? status);
    Task<TicketDto?> GetTicketByIdAsync(Guid id);
    Task<TicketDto> CreateTicketAsync(Guid userId, CreateTicketDto dto);
    Task<List<TicketMessageDto>> GetTicketMessagesAsync(Guid ticketId);
    Task<TicketMessageDto> AddTicketMessageAsync(Guid ticketId, Guid userId, CreateTicketMessageDto dto, bool isFromAdmin);
    Task<TicketDto> UpdateTicketStatusAsync(Guid ticketId, string status);
}
