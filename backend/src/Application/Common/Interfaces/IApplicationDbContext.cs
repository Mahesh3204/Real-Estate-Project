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

        // New tables for foundation milestone
        DbSet<Permission> Permissions { get; }
        DbSet<RolePermission> RolePermissions { get; }
        DbSet<Profile> Profiles { get; }
        DbSet<Country> Countries { get; }
        DbSet<State> States { get; }
        DbSet<City> Cities { get; }
        DbSet<Area> Areas { get; }
        DbSet<PropertyCategory> PropertyCategories { get; }
        DbSet<PropertyType> PropertyTypes { get; }
        DbSet<PropertyStatus> PropertyStatuses { get; }
        DbSet<PropertyCondition> PropertyConditions { get; }
        DbSet<Amenity> Amenities { get; }
        DbSet<RealEstate.Domain.Entities.File> Files { get; }
        DbSet<AuditLog> AuditLogs { get; }
        Microsoft.EntityFrameworkCore.DbSet<Microsoft.AspNetCore.Identity.IdentityUserRole<Guid>> UserRoles { get; }


        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    }
}
