using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities.CMS;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public ArticlesController(IUnitOfWork unitOfWork) { _unitOfWork = unitOfWork; }

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
        return NoContent();
    }
}
