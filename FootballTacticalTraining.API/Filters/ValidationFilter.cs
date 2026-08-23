using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FootballTacticalTraining.API.Filters;

public class ValidationFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (!context.ModelState.IsValid)
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .ToDictionary(
                    e => e.Key,
                    e => e.Value!.Errors.Select(x => x.ErrorMessage).ToArray()
                );

            context.Result = new BadRequestObjectResult(new ProblemDetails
            {
                Status = 400,
                Title = "Validation Error",
                Detail = "One or more validation errors occurred.",
                Extensions = { ["errors"] = errors }
            });
        }
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
}
