using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities.CMS;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballTacticalTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiscountController : ControllerBase
{
    private readonly IDiscountService _discountService;

    public DiscountController(IDiscountService discountService)
    {
        _discountService = discountService;
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
        return Ok(await _discountService.CreateAsync(discount));
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut("discounts/{id}")]
    public async Task<IActionResult> UpdateDiscount(Guid id, [FromBody] Discount discount)
    {
        discount.Id = id;
        return Ok(await _discountService.UpdateAsync(discount));
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("discounts/{id}")]
    public async Task<IActionResult> DeleteDiscount(Guid id)
    {
        await _discountService.DeleteAsync(id);
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
        return Ok(await _discountService.CreateCouponAsync(coupon));
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut("coupons/{id}")]
    public async Task<IActionResult> UpdateCoupon(Guid id, [FromBody] Coupon coupon)
    {
        coupon.Id = id;
        return Ok(await _discountService.UpdateCouponAsync(coupon));
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("coupons/{id}")]
    public async Task<IActionResult> DeleteCoupon(Guid id)
    {
        await _discountService.DeleteCouponAsync(id);
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
