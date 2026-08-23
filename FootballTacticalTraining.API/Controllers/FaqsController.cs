using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities.CMS;
using FootballTacticalTraining.Infrastructure.Audit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FaqsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditService _auditService;

    public FaqsController(IUnitOfWork unitOfWork, IAuditService auditService)
    {
        _unitOfWork = unitOfWork;
        _auditService = auditService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetFaqs([FromQuery] string? language = null)
    {
        var faqs = await _unitOfWork.Repository<Faq>().FindAsync(f => f.IsActive);
        if (!string.IsNullOrEmpty(language) && Enum.TryParse<Domain.Enums.Language>(language, true, out var lang))
            faqs = faqs.Where(f => f.Language == lang);
        return Ok(faqs.OrderBy(f => f.DisplayOrder).Select(f => new { f.Id, f.Question, f.Answer, f.Category, Language = f.Language.ToString() }));
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Faq faq)
    {
        faq.Id = Guid.NewGuid();
        faq.CreatedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<Faq>().AddAsync(faq);
        await _unitOfWork.SaveChangesAsync();
        await _auditService.LogAsync("Create", "Faq", faq.Id.ToString(), newValue: faq.Question, context: HttpContext);
        return CreatedAtAction(nameof(GetFaqs), new { }, faq);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Faq faq)
    {
        var existing = await _unitOfWork.Repository<Faq>().GetByIdAsync(id);
        if (existing == null) return NotFound();
        existing.Question = faq.Question;
        existing.Answer = faq.Answer;
        existing.Category = faq.Category;
        existing.Language = faq.Language;
        existing.IsActive = faq.IsActive;
        existing.DisplayOrder = faq.DisplayOrder;
        await _unitOfWork.Repository<Faq>().UpdateAsync(existing);
        await _unitOfWork.SaveChangesAsync();
        await _auditService.LogAsync("Update", "Faq", id.ToString(), newValue: faq.Question, context: HttpContext);
        return NoContent();
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _unitOfWork.Repository<Faq>().GetByIdAsync(id);
        if (existing == null) return NotFound();
        await _unitOfWork.Repository<Faq>().DeleteAsync(existing);
        await _unitOfWork.SaveChangesAsync();
        return NoContent();
    }
}
