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
