using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities.CMS;
using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Infrastructure.Audit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    public async Task<IActionResult> GetArticles([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? lang = null)
    {
        Language? language = ParseLanguage(lang);
        var articles = await _unitOfWork.Repository<Article>().FindAsync(a => a.IsPublished);
        var items = articles.OrderByDescending(a => a.PublishedAt).Skip((page - 1) * pageSize).Take(pageSize).Select(a =>
        {
            var tr = language.HasValue ? a.Translations.FirstOrDefault(t => t.Language == language.Value) : null;
            return new
            {
                a.Id,
                Title = tr?.Title ?? a.Title,
                Summary = tr?.Summary ?? a.Summary,
                Slug = tr?.Slug ?? a.Slug,
                a.CoverImageUrl,
                a.ViewCount,
                a.PublishedAt
            };
        }).ToList();
        return Ok(new { items, total = articles.Count() });
    }

    [HttpGet("{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBySlug(string slug, [FromQuery] string? lang = null)
    {
        Language? language = ParseLanguage(lang);
        var articles = await _unitOfWork.Repository<Article>().FindAsync(a => a.IsPublished);
        var article = articles.FirstOrDefault(a => a.Slug == slug || a.Translations.Any(t => t.Slug == slug));
        if (article == null) return NotFound();
        article.ViewCount++;
        await _unitOfWork.Repository<Article>().UpdateAsync(article);
        await _unitOfWork.SaveChangesAsync();
        var tr = language.HasValue ? article.Translations.FirstOrDefault(t => t.Language == language.Value) : null;
        return Ok(new
        {
            article.Id,
            Title = tr?.Title ?? article.Title,
            Content = tr?.Content ?? article.Content,
            Summary = tr?.Summary ?? article.Summary,
            Slug = tr?.Slug ?? article.Slug,
            article.CoverImageUrl,
            article.CoverImageAlt,
            article.ViewCount,
            article.PublishedAt,
            article.MetaTitle,
            article.MetaDescription,
            article.FocusKeyword,
            article.Keywords,
            article.CanonicalUrl,
            article.SchemaJson,
            article.ReadingTimeMinutes,
            Excerpt = tr?.Excerpt ?? article.Excerpt,
            Translations = article.Translations.Select(t => new
            {
                Language = t.Language.ToString(),
                t.Title,
                t.Content,
                t.Summary,
                t.Slug,
                t.MetaTitle,
                t.MetaDescription,
                t.FocusKeyword,
                t.Keywords,
                t.Excerpt
            })
        });
    }

    [Authorize(Roles = "Coach,Admin,SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateArticleRequest request)
    {
        var article = new Article
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            IsPublished = false,
            Title = request.Title,
            Content = request.Content,
            Summary = request.Summary,
            Slug = request.Slug,
            CoverImageUrl = request.CoverImageUrl,
            CoverImageAlt = request.CoverImageAlt,
            MetaTitle = request.MetaTitle,
            MetaDescription = request.MetaDescription,
            FocusKeyword = request.FocusKeyword,
            Keywords = request.Keywords
        };

        if (request.Translations != null)
        {
            foreach (var t in request.Translations)
            {
                if (Enum.TryParse<Language>(t.Language, true, out var lang))
                {
                    article.Translations.Add(new ArticleTranslation
                    {
                        Id = Guid.NewGuid(),
                        CreatedAt = DateTime.UtcNow,
                        ArticleId = article.Id,
                        Language = lang,
                        Title = t.Title,
                        Content = t.Content,
                        Summary = t.Summary,
                        Slug = t.Slug
                    });
                }
            }
        }

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
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateArticleRequest request)
    {
        var articles = await _unitOfWork.Repository<Article>().FindAsync(a => a.Id == id);
        var article = articles.FirstOrDefault();
        if (article == null) return NotFound();

        article.Title = request.Title;
        article.Content = request.Content;
        article.Summary = request.Summary;
        article.Slug = request.Slug;
        article.CoverImageUrl = request.CoverImageUrl;
        article.CoverImageAlt = request.CoverImageAlt;
        article.MetaTitle = request.MetaTitle;
        article.MetaDescription = request.MetaDescription;
        article.FocusKeyword = request.FocusKeyword;
        article.Keywords = request.Keywords;
        article.UpdatedAt = DateTime.UtcNow;

        if (request.Translations != null)
        {
            var existingTranslations = article.Translations.ToList();
            foreach (var et in existingTranslations)
            {
                await _unitOfWork.Repository<ArticleTranslation>().DeleteAsync(et);
            }

            foreach (var t in request.Translations)
            {
                if (Enum.TryParse<Language>(t.Language, true, out var lang))
                {
                    article.Translations.Add(new ArticleTranslation
                    {
                        Id = Guid.NewGuid(),
                        CreatedAt = DateTime.UtcNow,
                        ArticleId = article.Id,
                        Language = lang,
                        Title = t.Title,
                        Content = t.Content,
                        Summary = t.Summary,
                        Slug = t.Slug
                    });
                }
            }
        }

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

        var translations = article.Translations.ToList();
        foreach (var t in translations)
        {
            await _unitOfWork.Repository<ArticleTranslation>().DeleteAsync(t);
        }

        await _unitOfWork.Repository<Article>().DeleteAsync(article);
        await _unitOfWork.SaveChangesAsync();
        return NoContent();
    }

    private static Language? ParseLanguage(string? lang)
    {
        if (string.IsNullOrEmpty(lang)) return null;
        if (Enum.TryParse<Language>(lang, true, out var l)) return l;
        return null;
    }
}

public class TranslationRequest
{
    public string Language { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string Slug { get; set; } = string.Empty;
}

public class CreateArticleRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? Slug { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? CoverImageAlt { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? FocusKeyword { get; set; }
    public string? Keywords { get; set; }
    public List<TranslationRequest>? Translations { get; set; }
}

public class UpdateArticleRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? Slug { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? CoverImageAlt { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? FocusKeyword { get; set; }
    public string? Keywords { get; set; }
    public List<TranslationRequest>? Translations { get; set; }
}
