using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities.CMS;

namespace FootballTacticalTraining.Infrastructure.Services;

public class DiscountService : IDiscountService
{
    private readonly IUnitOfWork _unitOfWork;

    public DiscountService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<Discount>> GetAllDiscountsAsync()
    {
        var all = await _unitOfWork.Repository<Discount>().FindAsync(d => !d.IsDeleted); return all.ToList();
    }

    public async Task<Discount?> GetByIdAsync(Guid id)
    {
        return await _unitOfWork.Repository<Discount>().GetByIdAsync(id);
    }

    public async Task<Discount> CreateAsync(Discount discount)
    {
        await _unitOfWork.Repository<Discount>().AddAsync(discount);
        await _unitOfWork.SaveChangesAsync();
        return discount;
    }

    public async Task<Discount> UpdateAsync(Discount discount)
    {
        await _unitOfWork.Repository<Discount>().UpdateAsync(discount);
        await _unitOfWork.SaveChangesAsync();
        return discount;
    }

    public async Task DeleteAsync(Guid id)
    {
        var d = await _unitOfWork.Repository<Discount>().GetByIdAsync(id);
        if (d != null) { d.IsDeleted = true; await _unitOfWork.Repository<Discount>().UpdateAsync(d); await _unitOfWork.SaveChangesAsync(); }
    }

    public async Task<List<Coupon>> GetAllCouponsAsync()
    {
        var all = await _unitOfWork.Repository<Coupon>().FindAsync(c => !c.IsDeleted); return all.ToList();
    }

    public async Task<Coupon?> GetCouponByCodeAsync(string code)
    {
        var coupons = await _unitOfWork.Repository<Coupon>().FindAsync(c => c.Code == code && !c.IsDeleted);
        return coupons.FirstOrDefault();
    }

    public async Task<Coupon> CreateCouponAsync(Coupon coupon)
    {
        await _unitOfWork.Repository<Coupon>().AddAsync(coupon);
        await _unitOfWork.SaveChangesAsync();
        return coupon;
    }

    public async Task<Coupon> UpdateCouponAsync(Coupon coupon)
    {
        await _unitOfWork.Repository<Coupon>().UpdateAsync(coupon);
        await _unitOfWork.SaveChangesAsync();
        return coupon;
    }

    public async Task DeleteCouponAsync(Guid id)
    {
        var c = await _unitOfWork.Repository<Coupon>().GetByIdAsync(id);
        if (c != null) { c.IsDeleted = true; await _unitOfWork.Repository<Coupon>().UpdateAsync(c); await _unitOfWork.SaveChangesAsync(); }
    }

    public async Task<Coupon?> ValidateCouponAsync(string code, Guid planId)
    {
        var coupon = await GetCouponByCodeAsync(code);
        if (coupon == null) return null;
        if (coupon.EndDate < DateTime.UtcNow) return null;
        if (coupon.MaxUses.HasValue && coupon.CurrentUses >= coupon.MaxUses.Value) return null;
        return coupon;
    }
}
