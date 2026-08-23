using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities.CMS;
using FootballTacticalTraining.Infrastructure.Audit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditService _auditService;

    public ArticlesController(IUnitOfWork unitOfWork, IAuditService auditService)
    {
        _unitOfWork = unitOfWork;
        _auditService = auditService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetArticles([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var articles = await _unitOfWork.Repository<Article>().FindAsync(a => a.IsPublished);
        var items = articles.OrderByDescending(a => a.PublishedAt).Skip((page - 1) * pageSize).Take(pageSize).Select(a => new
        {
            a.Id, a.Title, a.Summary, a.Slug, a.CoverImageUrl, a.ViewCount, a.PublishedAt
        }).ToList();
        return Ok(new { items, total = articles.Count() });
    }

    [HttpGet("{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var articles = await _unitOfWork.Repository<Article>().FindAsync(a => a.Slug == slug && a.IsPublished);
        var article = articles.FirstOrDefault();
        if (article == null) return NotFound();
        article.ViewCount++;
        await _unitOfWork.Repository<Article>().UpdateAsync(article);
        await _unitOfWork.SaveChangesAsync();
        return Ok(new { article.Id, article.Title, article.Content, article.Summary, article.Slug, article.CoverImageUrl, article.ViewCount, article.PublishedAt });
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Article article)
    {
        article.Id = Guid.NewGuid();
        article.CreatedAt = DateTime.UtcNow;
        article.IsPublished = false;
        await _unitOfWork.Repository<Article>().AddAsync(article);
        await _unitOfWork.SaveChangesAsync();
        await _auditService.LogAsync("Create", "Article", article.Id.ToString(), newValue: article.Title, context: HttpContext);
        return CreatedAtAction(nameof(GetBySlug), new { slug = article.Slug }, article);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut("{id}/publish")]
    public async Task<IActionResult> Publish(Guid id)
    {
        var articles = await _unitOfWork.Repository<Article>().FindAsync(a => a.Id == id);
        var article = articles.FirstOrDefault();
        if (article == null) return NotFound();
        article.IsPublished = true;
        article.PublishedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<Article>().UpdateAsync(article);
        await _unitOfWork.SaveChangesAsync();
        await _auditService.LogAsync("Publish", "Article", article.Id.ToString(), newValue: article.Title, context: HttpContext);
        return NoContent();
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Article updated)
    {
        var articles = await _unitOfWork.Repository<Article>().FindAsync(a => a.Id == id);
        var article = articles.FirstOrDefault();
        if (article == null) return NotFound();
        article.Title = updated.Title;
        article.Content = updated.Content;
        article.Summary = updated.Summary;
        article.Slug = updated.Slug;
        article.CoverImageUrl = updated.CoverImageUrl;
        await _unitOfWork.Repository<Article>().UpdateAsync(article);
        await _unitOfWork.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var articles = await _unitOfWork.Repository<Article>().FindAsync(a => a.Id == id);
        var article = articles.FirstOrDefault();
        if (article == null) return NotFound();
        await _unitOfWork.Repository<Article>().DeleteAsync(article);
        await _unitOfWork.SaveChangesAsync();
        return NoContent();
    }
}
