using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<PropertyFavorite> PropertyFavorites { get; set; } = null!;
        public DbSet<PropertyInquiry> PropertyInquiries { get; set; } = null!;
        public DbSet<RecentlyViewed> RecentlyViewed { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure PropertyFavorite
            builder.Entity<PropertyFavorite>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.PropertyId }).IsUnique();

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure PropertyInquiry
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

            // Configure RecentlyViewed
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
}
