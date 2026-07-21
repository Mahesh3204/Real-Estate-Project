using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Common;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<User, Role, Guid>, IApplicationDbContext
    {
        private readonly ICurrentUserService _currentUserService;

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options,
            ICurrentUserService currentUserService)
            : base(options)
        {
            _currentUserService = currentUserService;
        }

        public DbSet<PropertyFavorite> PropertyFavorites { get; set; } = null!;
        public DbSet<PropertyInquiry> PropertyInquiries { get; set; } = null!;
        public DbSet<RecentlyViewed> RecentlyViewed { get; set; } = null!;
        public DbSet<SavedSearch> SavedSearches { get; set; } = null!;

        // Foundation tables
        public DbSet<Permission> Permissions { get; set; } = null!;
        public DbSet<RolePermission> RolePermissions { get; set; } = null!;
        public DbSet<Profile> Profiles { get; set; } = null!;
        public DbSet<Country> Countries { get; set; } = null!;
        public DbSet<State> States { get; set; } = null!;
        public DbSet<City> Cities { get; set; } = null!;
        public DbSet<Area> Areas { get; set; } = null!;
        public DbSet<PropertyCategory> PropertyCategories { get; set; } = null!;
        public DbSet<PropertyType> PropertyTypes { get; set; } = null!;
        public DbSet<PropertyStatus> PropertyStatuses { get; set; } = null!;
        public DbSet<PropertyCondition> PropertyConditions { get; set; } = null!;
        public DbSet<Amenity> Amenities { get; set; } = null!;
        public DbSet<RealEstate.Domain.Entities.File> Files { get; set; } = null!;
        public DbSet<AuditLog> AuditLogs { get; set; } = null!;

        public DbSet<Property> Properties { get; set; } = null!;
        public DbSet<PropertyMedia> PropertyMedias { get; set; } = null!;
        public DbSet<PropertyDocument> PropertyDocuments { get; set; } = null!;
        public DbSet<PropertyFloorPlan> PropertyFloorPlans { get; set; } = null!;
        public DbSet<PropertyAuditLog> PropertyAuditLogs { get; set; } = null!;

        public DbSet<RoleRequest> RoleRequests { get; set; } = null!;
        public DbSet<RoleRequestHistory> RoleRequestHistories { get; set; } = null!;
        public DbSet<SystemSetting> SystemSettings { get; set; } = null!;

        public DbSet<Appointment> Appointments { get; set; } = null!;
        public DbSet<Conversation> Conversations { get; set; } = null!;
        public DbSet<Message> Messages { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<Offer> Offers { get; set; } = null!;
        public DbSet<Review> Reviews { get; set; } = null!;


        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            OnBeforeSaveChanges();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private void OnBeforeSaveChanges()
        {
            ChangeTracker.DetectChanges();
            var auditEntries = new List<AuditEntry>();

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                    continue;

                if (entry.Entity is IAuditable)
                {
                    var auditEntry = new AuditEntry(entry)
                    {
                        TableName = entry.Entity.GetType().Name,
                        UserId = _currentUserService.UserId,
                        UserEmail = _currentUserService.UserEmail,
                        IpAddress = _currentUserService.IpAddress,
                        UserAgent = _currentUserService.UserAgent
                    };
                    auditEntries.Add(auditEntry);

                    foreach (var property in entry.Properties)
                    {
                        string propertyName = property.Metadata.Name;
                        if (property.Metadata.IsPrimaryKey())
                        {
                            auditEntry.KeyValues[propertyName] = property.CurrentValue!;
                            continue;
                        }

                        switch (entry.State)
                        {
                            case EntityState.Added:
                                auditEntry.NewValues[propertyName] = property.CurrentValue!;
                                break;

                            case EntityState.Deleted:
                                auditEntry.OldValues[propertyName] = property.OriginalValue!;
                                break;

                            case EntityState.Modified:
                                if (property.IsModified)
                                {
                                    auditEntry.OldValues[propertyName] = property.OriginalValue!;
                                    auditEntry.NewValues[propertyName] = property.CurrentValue!;
                                }
                                break;
                        }
                    }
                }
            }

            foreach (var auditEntry in auditEntries)
            {
                AuditLogs.Add(auditEntry.ToAuditLog());
            }
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Rename Identity Tables
            builder.Entity<User>().ToTable("users");
            builder.Entity<Role>().ToTable("roles");
            builder.Entity<IdentityUserRole<Guid>>().ToTable("user_roles");
            builder.Entity<IdentityUserClaim<Guid>>().ToTable("user_claims");
            builder.Entity<IdentityUserLogin<Guid>>().ToTable("user_logins");
            builder.Entity<IdentityRoleClaim<Guid>>().ToTable("role_claims");
            builder.Entity<IdentityUserToken<Guid>>().ToTable("user_tokens");

            // Configure RolePermission
            builder.Entity<RolePermission>(entity =>
            {
                entity.ToTable("role_permissions");
                entity.HasKey(rp => new { rp.RoleId, rp.PermissionId });

                entity.HasOne(rp => rp.Role)
                    .WithMany(r => r.RolePermissions)
                    .HasForeignKey(rp => rp.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(rp => rp.Permission)
                    .WithMany(p => p.RolePermissions)
                    .HasForeignKey(rp => rp.PermissionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Permission
            builder.Entity<Permission>(entity =>
            {
                entity.ToTable("permissions");
                entity.HasKey(p => p.Id);
                entity.HasIndex(p => p.Name).IsUnique();
            });

            // Configure Profile
            builder.Entity<Profile>(entity =>
            {
                entity.ToTable("profiles");
                entity.HasKey(p => p.Id);

                entity.HasOne(p => p.User)
                    .WithOne()
                    .HasForeignKey<Profile>(p => p.Id)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(p => p.Country)
                    .WithMany()
                    .HasForeignKey(p => p.CountryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.State)
                    .WithMany()
                    .HasForeignKey(p => p.StateId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.City)
                    .WithMany()
                    .HasForeignKey(p => p.CityId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Locations
            builder.Entity<Country>(entity =>
            {
                entity.ToTable("countries");
                entity.HasKey(c => c.Id);
                entity.HasIndex(c => c.Name).IsUnique();
                entity.HasIndex(c => c.Code).IsUnique();
                entity.HasQueryFilter(c => !c.IsDeleted);
            });

            builder.Entity<State>(entity =>
            {
                entity.ToTable("states");
                entity.HasKey(s => s.Id);

                entity.HasOne(s => s.Country)
                    .WithMany(c => c.States)
                    .HasForeignKey(s => s.CountryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasQueryFilter(s => !s.IsDeleted);
            });

            builder.Entity<City>(entity =>
            {
                entity.ToTable("cities");
                entity.HasKey(c => c.Id);

                entity.HasOne(c => c.State)
                    .WithMany(s => s.Cities)
                    .HasForeignKey(c => c.StateId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasQueryFilter(c => !c.IsDeleted);
            });

            builder.Entity<Area>(entity =>
            {
                entity.ToTable("areas");
                entity.HasKey(a => a.Id);

                entity.HasOne(a => a.City)
                    .WithMany(c => c.Areas)
                    .HasForeignKey(a => a.CityId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasQueryFilter(a => !a.IsDeleted);
            });

            // Configure Property Taxonomy
            builder.Entity<PropertyCategory>(entity =>
            {
                entity.ToTable("property_categories");
                entity.HasKey(c => c.Id);
                entity.HasIndex(c => c.Name).IsUnique();
                entity.HasIndex(c => c.Slug).IsUnique();
                entity.HasQueryFilter(c => !c.IsDeleted);
            });

            builder.Entity<PropertyType>(entity =>
            {
                entity.ToTable("property_types");
                entity.HasKey(t => t.Id);
                entity.HasIndex(t => t.Slug).IsUnique();

                entity.HasOne(t => t.Category)
                    .WithMany(c => c.PropertyTypes)
                    .HasForeignKey(t => t.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<PropertyStatus>(entity =>
            {
                entity.ToTable("property_statuses");
                entity.HasKey(s => s.Id);
                entity.HasIndex(s => s.Name).IsUnique();
            });

            builder.Entity<PropertyCondition>(entity =>
            {
                entity.ToTable("property_conditions");
                entity.HasKey(c => c.Id);
                entity.HasIndex(c => c.Name).IsUnique();
            });

            builder.Entity<Amenity>(entity =>
            {
                entity.ToTable("amenities");
                entity.HasKey(a => a.Id);
                entity.HasIndex(a => a.Slug).IsUnique();
                entity.HasQueryFilter(a => !a.IsDeleted);
            });

            // Configure File & AuditLog
            builder.Entity<RealEstate.Domain.Entities.File>(entity =>
            {
                entity.ToTable("files");
                entity.HasKey(f => f.Id);
            });


            builder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("audit_logs");
                entity.HasKey(l => l.Id);
            });

            // Configure Existing Favorites/Inquiries/RecentlyViewed
            builder.Entity<PropertyFavorite>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.PropertyId }).IsUnique();

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<PropertyInquiry>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Message).IsRequired();
                entity.Property(e => e.Status).HasMaxLength(50).IsRequired();

                entity.HasOne(e => e.Buyer)
                    .WithMany()
                    .HasForeignKey(e => e.BuyerId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<RecentlyViewed>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<SavedSearch>(entity =>
            {
                entity.ToTable("saved_searches");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId);
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.QueryParameters).IsRequired();

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Property
            builder.Entity<Property>(entity =>
            {
                entity.ToTable("properties");
                entity.HasKey(p => p.Id);
                entity.HasIndex(p => p.Slug).IsUnique();
                entity.HasQueryFilter(p => !p.IsDeleted);

                entity.HasOne(p => p.Category)
                    .WithMany()
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.PropertyType)
                    .WithMany()
                    .HasForeignKey(p => p.PropertyTypeId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Status)
                    .WithMany()
                    .HasForeignKey(p => p.StatusId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Condition)
                    .WithMany()
                    .HasForeignKey(p => p.ConditionId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Country)
                    .WithMany()
                    .HasForeignKey(p => p.CountryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.State)
                    .WithMany()
                    .HasForeignKey(p => p.StateId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.City)
                    .WithMany()
                    .HasForeignKey(p => p.CityId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Owner)
                    .WithMany()
                    .HasForeignKey(p => p.OwnerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(p => p.Amenities)
                    .WithMany();
            });

            // Configure PropertyMedia
            builder.Entity<PropertyMedia>(entity =>
            {
                entity.ToTable("property_media");
                entity.HasKey(m => m.Id);

                entity.HasOne(m => m.Property)
                    .WithMany(p => p.Media)
                    .HasForeignKey(m => m.PropertyId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure PropertyDocument
            builder.Entity<PropertyDocument>(entity =>
            {
                entity.ToTable("property_documents");
                entity.HasKey(d => d.Id);

                entity.HasOne(d => d.Property)
                    .WithMany(p => p.Documents)
                    .HasForeignKey(d => d.PropertyId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure PropertyFloorPlan
            builder.Entity<PropertyFloorPlan>(entity =>
            {
                entity.ToTable("property_floor_plans");
                entity.HasKey(f => f.Id);

                entity.HasOne(f => f.Property)
                    .WithMany(p => p.FloorPlans)
                    .HasForeignKey(f => f.PropertyId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure PropertyAuditLog
            builder.Entity<PropertyAuditLog>(entity =>
            {
                entity.ToTable("property_audit_logs");
                entity.HasKey(l => l.Id);

                entity.HasOne(l => l.Property)
                    .WithMany(p => p.AuditLogs)
                    .HasForeignKey(l => l.PropertyId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(l => l.User)
                    .WithMany()
                    .HasForeignKey(l => l.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure ActiveRole relationship on User
            builder.Entity<User>()
                .HasOne(u => u.ActiveRole)
                .WithMany()
                .HasForeignKey(u => u.ActiveRoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure RoleRequest
            builder.Entity<RoleRequest>(entity =>
            {
                entity.ToTable("role_requests");
                entity.HasKey(r => r.Id);

                entity.HasOne(r => r.User)
                    .WithMany()
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.RequestedRole)
                    .WithMany()
                    .HasForeignKey(r => r.RequestedRoleId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Reviewer)
                    .WithMany()
                    .HasForeignKey(r => r.ReviewedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure RoleRequestHistory
            builder.Entity<RoleRequestHistory>(entity =>
            {
                entity.ToTable("role_request_histories");
                entity.HasKey(rh => rh.Id);

                entity.HasOne(rh => rh.Request)
                    .WithMany()
                    .HasForeignKey(rh => rh.RequestId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(rh => rh.ChangedByUser)
                    .WithMany()
                    .HasForeignKey(rh => rh.ChangedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure SystemSetting
            builder.Entity<SystemSetting>(entity =>
            {
                entity.ToTable("system_settings");
                entity.HasKey(s => s.Key);
                entity.Property(s => s.Key).HasMaxLength(100);
                entity.Property(s => s.Value).HasMaxLength(500);
            });

            // Configure PropertyInquiry overrides
            builder.Entity<PropertyInquiry>(entity =>
            {
                entity.ToTable("property_inquiries");
                entity.HasIndex(e => new { e.BuyerId, e.IsDeleted });
                entity.HasIndex(e => new { e.PropertyId, e.IsDeleted });
                entity.HasOne(e => e.Property)
                    .WithMany()
                    .HasForeignKey(e => e.PropertyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Status)
                    .HasConversion<string>()
                    .HasMaxLength(50);
            });

            // Configure Appointment
            builder.Entity<Appointment>(entity =>
            {
                entity.ToTable("appointments");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.BuyerId, e.PropertyId, e.Status })
                    .HasFilter("\"Status\" = 0") // Filtered index for Pending (0)
                    .IsUnique();

                entity.HasOne(e => e.Property)
                    .WithMany()
                    .HasForeignKey(e => e.PropertyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Buyer)
                    .WithMany()
                    .HasForeignKey(e => e.BuyerId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Conversation
            builder.Entity<Conversation>(entity =>
            {
                entity.ToTable("conversations");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.BuyerId, e.PropertyId }).IsUnique();

                entity.HasOne(e => e.Property)
                    .WithMany()
                    .HasForeignKey(e => e.PropertyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Buyer)
                    .WithMany()
                    .HasForeignKey(e => e.BuyerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Seller)
                    .WithMany()
                    .HasForeignKey(e => e.SellerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Message
            builder.Entity<Message>(entity =>
            {
                entity.ToTable("messages");
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.Conversation)
                    .WithMany(c => c.Messages)
                    .HasForeignKey(e => e.ConversationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Sender)
                    .WithMany()
                    .HasForeignKey(e => e.SenderId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Notification
            builder.Entity<Notification>(entity =>
            {
                entity.ToTable("notifications");
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.Recipient)
                    .WithMany()
                    .HasForeignKey(e => e.RecipientId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Offer
            builder.Entity<Offer>(entity =>
            {
                entity.ToTable("offers");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.BuyerId, e.PropertyId, e.Status })
                    .HasFilter("\"Status\" = 0") // Enforce single active pending offer
                    .IsUnique();

                entity.HasOne(e => e.Property)
                    .WithMany()
                    .HasForeignKey(e => e.PropertyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Buyer)
                    .WithMany()
                    .HasForeignKey(e => e.BuyerId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Review
            builder.Entity<Review>(entity =>
            {
                entity.ToTable("reviews");
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.Property)
                    .WithMany()
                    .HasForeignKey(e => e.PropertyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Buyer)
                    .WithMany()
                    .HasForeignKey(e => e.BuyerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Seller)
                    .WithMany()
                    .HasForeignKey(e => e.SellerId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }

    public class AuditEntry
    {
        public AuditEntry(EntityEntry entry)
        {
            Entry = entry;
        }

        public EntityEntry Entry { get; }
        public string TableName { get; set; } = string.Empty;
        public Guid? UserId { get; set; }
        public string? UserEmail { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public Dictionary<string, object> KeyValues { get; } = new();
        public Dictionary<string, object> OldValues { get; } = new();
        public Dictionary<string, object> NewValues { get; } = new();

        public AuditLog ToAuditLog()
        {
            var auditLog = new AuditLog
            {
                UserId = UserId,
                UserEmail = UserEmail,
                Action = Entry.State switch
                {
                    EntityState.Added => "Create",
                    EntityState.Deleted => "Delete",
                    EntityState.Modified => "Update",
                    _ => "Unknown"
                },
                Resource = TableName,
                ResourceId = KeyValues.Count > 0 ? System.Text.Json.JsonSerializer.Serialize(KeyValues) : string.Empty,
                OldValues = OldValues.Count > 0 ? System.Text.Json.JsonSerializer.Serialize(OldValues) : null,
                NewValues = NewValues.Count > 0 ? System.Text.Json.JsonSerializer.Serialize(NewValues) : null,
                Timestamp = DateTime.UtcNow,
                IpAddress = IpAddress,
                UserAgent = UserAgent
            };
            return auditLog;
        }
    }
}
