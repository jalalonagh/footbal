using FootballTacticalTraining.Domain.Entities.CMS;

namespace FootballTacticalTraining.Application.Interfaces;

public interface IDiscountService
{
    Task<List<Discount>> GetAllDiscountsAsync();
    Task<Discount?> GetByIdAsync(Guid id);
    Task<Discount> CreateAsync(Discount discount);
    Task<Discount> UpdateAsync(Discount discount);
    Task DeleteAsync(Guid id);
    Task<List<Coupon>> GetAllCouponsAsync();
    Task<Coupon?> GetCouponByCodeAsync(string code);
    Task<Coupon> CreateCouponAsync(Coupon coupon);
    Task<Coupon> UpdateCouponAsync(Coupon coupon);
    Task DeleteCouponAsync(Guid id);
    Task<Coupon?> ValidateCouponAsync(string code, Guid planId);
}
