using FootballTacticalTraining.Application.DTOs.CMS;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities.CMS;
using FootballTacticalTraining.Infrastructure.Data;

namespace FootballTacticalTraining.Infrastructure.Services;

public class ContactService : IContactService
{
    private readonly IUnitOfWork _unitOfWork;

    public ContactService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ContactSettingDto?> GetContactSettingsAsync()
    {
        var setting = (await _unitOfWork.Repository<ContactSetting>().GetAllAsync()).FirstOrDefault();
        if (setting == null) return null;

        return MapToDto(setting);
    }

    public async Task<ContactSettingDto> UpdateContactSettingsAsync(ContactSettingDto dto)
    {
        var setting = (await _unitOfWork.Repository<ContactSetting>().GetAllAsync()).FirstOrDefault();
        if (setting == null)
        {
            setting = new ContactSetting
            {
                MobilePhone = dto.MobilePhone,
                OfficePhone = dto.OfficePhone,
                Email = dto.Email,
                Fax = dto.Fax,
                Address = dto.Address,
                Instagram = dto.Instagram,
                Twitter = dto.Twitter,
                Facebook = dto.Facebook,
                Telegram = dto.Telegram,
                WhatsApp = dto.WhatsApp,
                LinkedIn = dto.LinkedIn,
                YouTube = dto.YouTube
            };
            await _unitOfWork.Repository<ContactSetting>().AddAsync(setting);
        }
        else
        {
            setting.MobilePhone = dto.MobilePhone;
            setting.OfficePhone = dto.OfficePhone;
            setting.Email = dto.Email;
            setting.Fax = dto.Fax;
            setting.Address = dto.Address;
            setting.Instagram = dto.Instagram;
            setting.Twitter = dto.Twitter;
            setting.Facebook = dto.Facebook;
            setting.Telegram = dto.Telegram;
            setting.WhatsApp = dto.WhatsApp;
            setting.LinkedIn = dto.LinkedIn;
            setting.YouTube = dto.YouTube;
            setting.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<ContactSetting>().UpdateAsync(setting);
        }
        await _unitOfWork.SaveChangesAsync();
        return MapToDto(setting);
    }

    private static ContactSettingDto MapToDto(ContactSetting s)
    {
        return new ContactSettingDto
        {
            Id = s.Id,
            MobilePhone = s.MobilePhone,
            OfficePhone = s.OfficePhone,
            Email = s.Email,
            Fax = s.Fax,
            Address = s.Address,
            Instagram = s.Instagram,
            Twitter = s.Twitter,
            Facebook = s.Facebook,
            Telegram = s.Telegram,
            WhatsApp = s.WhatsApp,
            LinkedIn = s.LinkedIn,
            YouTube = s.YouTube
        };
    }
}
