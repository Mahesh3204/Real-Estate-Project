using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace RealEstate.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<PropertyFavorite> PropertyFavorites { get; }
        DbSet<PropertyInquiry> PropertyInquiries { get; }
        DbSet<RecentlyViewed> RecentlyViewed { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
