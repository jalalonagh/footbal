using FootballTacticalTraining.Domain.Entities;

namespace FootballTacticalTraining.Domain.Entities.CMS;

public class ContactSetting : BaseEntity
{
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
