using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities.CMS;
using FootballTacticalTraining.Infrastructure.Audit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiscountController : ControllerBase
{
    private readonly IDiscountService _discountService;
    private readonly IAuditService _auditService;

    public DiscountController(IDiscountService discountService, IAuditService auditService)
    {
        _discountService = discountService;
        _auditService = auditService;
    }

    [HttpGet("discounts")]
    public async Task<IActionResult> GetAllDiscounts()
    {
        return Ok(await _discountService.GetAllDiscountsAsync());
    }

    [HttpGet("discounts/{id}")]
    public async Task<IActionResult> GetDiscount(Guid id)
    {
        var d = await _discountService.GetByIdAsync(id);
        if (d == null) return NotFound();
        return Ok(d);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost("discounts")]
    public async Task<IActionResult> CreateDiscount([FromBody] Discount discount)
    {
        var result = await _discountService.CreateAsync(discount);
        await _auditService.LogAsync("Create", "Discount", result.Id.ToString(), newValue: result.Code, context: HttpContext);
        return Ok(result);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut("discounts/{id}")]
    public async Task<IActionResult> UpdateDiscount(Guid id, [FromBody] Discount discount)
    {
        discount.Id = id;
        var result = await _discountService.UpdateAsync(discount);
        await _auditService.LogAsync("Update", "Discount", id.ToString(), newValue: discount.Code, context: HttpContext);
        return Ok(result);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("discounts/{id}")]
    public async Task<IActionResult> DeleteDiscount(Guid id)
    {
        await _discountService.DeleteAsync(id);
        await _auditService.LogAsync("Delete", "Discount", id.ToString(), context: HttpContext);
        return NoContent();
    }

    [HttpGet("coupons")]
    public async Task<IActionResult> GetAllCoupons()
    {
        return Ok(await _discountService.GetAllCouponsAsync());
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost("coupons")]
    public async Task<IActionResult> CreateCoupon([FromBody] Coupon coupon)
    {
        var result = await _discountService.CreateCouponAsync(coupon);
        await _auditService.LogAsync("Create", "Coupon", result.Id.ToString(), newValue: result.Code, context: HttpContext);
        return Ok(result);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut("coupons/{id}")]
    public async Task<IActionResult> UpdateCoupon(Guid id, [FromBody] Coupon coupon)
    {
        coupon.Id = id;
        var result = await _discountService.UpdateCouponAsync(coupon);
        await _auditService.LogAsync("Update", "Coupon", id.ToString(), newValue: coupon.Code, context: HttpContext);
        return Ok(result);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("coupons/{id}")]
    public async Task<IActionResult> DeleteCoupon(Guid id)
    {
        await _discountService.DeleteCouponAsync(id);
        await _auditService.LogAsync("Delete", "Coupon", id.ToString(), context: HttpContext);
        return NoContent();
    }

    [HttpPost("coupons/validate")]
    public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponRequest request)
    {
        var coupon = await _discountService.ValidateCouponAsync(request.Code, request.PlanId);
        if (coupon == null) return BadRequest(new { message = "Invalid or expired coupon" });
        return Ok(coupon);
    }
}

public record ValidateCouponRequest(string Code, Guid PlanId);
