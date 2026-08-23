using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace FootballTacticalTraining.API.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/problem+json";

        var (statusCode, title) = exception switch
        {
            ArgumentException e => (400, e.Message),
            KeyNotFoundException e => (404, e.Message),
            UnauthorizedAccessException e => (401, "Unauthorized"),
            InvalidOperationException e => (409, e.Message),
            TimeoutException e => (504, "Request timeout"),
            _ => (500, "An unexpected error occurred")
        };

        context.Response.StatusCode = statusCode;

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Type = $"https://httpstatuses.com/{statusCode}",
            Instance = context.Request.Path
        };

        if (statusCode == 500)
        {
            problem.Detail = "An unexpected error occurred. Please try again later.";
        }

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsync(JsonSerializer.Serialize(problem, options));
    }
}
