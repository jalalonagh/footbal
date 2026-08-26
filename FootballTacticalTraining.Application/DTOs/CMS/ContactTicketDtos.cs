using System.ComponentModel.DataAnnotations;

namespace FootballTacticalTraining.Application.DTOs.CMS;

public class ContactSettingDto
{
    public Guid? Id { get; set; }
    public string? MobilePhone { get; set; }
    public string? OfficePhone { get; set; }
    public string? Email { get; set; }
    public string? Fax { get; set; }
    public string? Address { get; set; }
    public string? Instagram { get; set; }
    public string? Twitter { get; set; }
    public string? Facebook { get; set; }
    public string? Telegram { get; set; }
    public string? WhatsApp { get; set; }
    public string? LinkedIn { get; set; }
    public string? YouTube { get; set; }
}

public class CreateTicketDto
{
    [Required]
    [StringLength(200, MinimumLength = 3)]
    public string Subject { get; set; } = null!;
}

public class TicketDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string Priority { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int MessageCount { get; set; }
}

public class TicketMessageDto
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = null!;
    public string Message { get; set; } = null!;
    public bool IsFromAdmin { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTicketMessageDto
{
    [Required]
    public string Message { get; set; } = null!;
}

public class UpdateTicketStatusDto
{
    [Required]
    public string Status { get; set; } = null!;
}
