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
        DbSet<SavedSearch> SavedSearches { get; }

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
        DbSet<User> Users { get; }

        DbSet<Property> Properties { get; }
        DbSet<PropertyMedia> PropertyMedias { get; }
        DbSet<PropertyDocument> PropertyDocuments { get; }
        DbSet<PropertyFloorPlan> PropertyFloorPlans { get; }
        DbSet<PropertyAuditLog> PropertyAuditLogs { get; }

        DbSet<RoleRequest> RoleRequests { get; }
        DbSet<RoleRequestHistory> RoleRequestHistories { get; }
        DbSet<SystemSetting> SystemSettings { get; }

        DbSet<Appointment> Appointments { get; }
        DbSet<Conversation> Conversations { get; }
        DbSet<Message> Messages { get; }
        DbSet<Notification> Notifications { get; }
        DbSet<Offer> Offers { get; }
        DbSet<Review> Reviews { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    }
}
