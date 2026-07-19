using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context, RoleManager<Role> roleManager, UserManager<User> userManager)
        {
            // Apply pending database migrations automatically
            await context.Database.MigrateAsync();

            // 1. Seed Roles
            var roles = new[] { "Admin", "Agent", "Buyer", "Seller" };
            foreach (var roleName in roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new Role(roleName));
                }
            }

            // 2. Seed Permissions
            var permissions = new List<Permission>
            {
                new() { Name = "role.read", Description = "View system roles" },
                new() { Name = "role.create", Description = "Create new roles" },
                new() { Name = "role.update", Description = "Edit role properties" },
                new() { Name = "role.delete", Description = "Delete roles" },

                new() { Name = "permission.read", Description = "View system permissions" },
                new() { Name = "permission.create", Description = "Register system permissions" },
                new() { Name = "permission.update", Description = "Edit permissions" },
                new() { Name = "permission.delete", Description = "Unregister permissions" },

                new() { Name = "location.create", Description = "Create countries/states/cities/areas" },
                new() { Name = "location.update", Description = "Edit location details" },
                new() { Name = "location.delete", Description = "Soft delete geographical nodes" },

                new() { Name = "category.create", Description = "Create property categories" },
                new() { Name = "category.update", Description = "Edit property categories" },
                new() { Name = "category.delete", Description = "Delete property categories" },

                new() { Name = "type.create", Description = "Create property sub-types" },
                new() { Name = "type.update", Description = "Edit property sub-types" },
                new() { Name = "type.delete", Description = "Delete property sub-types" },

                new() { Name = "status.create", Description = "Create transaction statuses" },
                new() { Name = "status.update", Description = "Edit transaction statuses" },
                new() { Name = "status.delete", Description = "Delete transaction statuses" },

                new() { Name = "condition.create", Description = "Create structural conditions" },
                new() { Name = "condition.update", Description = "Edit structural conditions" },
                new() { Name = "condition.delete", Description = "Delete structural conditions" },

                new() { Name = "amenity.create", Description = "Create amenities" },
                new() { Name = "amenity.update", Description = "Edit amenities" },
                new() { Name = "amenity.delete", Description = "Delete amenities" },

                new() { Name = "audit-log.read", Description = "Access administrative system changes logs feed" }
            };

            foreach (var perm in permissions)
            {
                if (!await context.Permissions.AnyAsync(p => p.Name == perm.Name))
                {
                    context.Permissions.Add(perm);
                }
            }
            await context.SaveChangesAsync();

            // 3. Map all permissions to Admin Role in role_permissions table
            var adminRole = await roleManager.FindByNameAsync("Admin");
            if (adminRole != null)
            {
                var dbPermissions = await context.Permissions.ToListAsync();
                var existingRolePerms = await context.RolePermissions
                    .Where(rp => rp.RoleId == adminRole.Id)
                    .Select(rp => rp.PermissionId)
                    .ToListAsync();

                foreach (var p in dbPermissions)
                {
                    if (!existingRolePerms.Contains(p.Id))
                    {
                        context.RolePermissions.Add(new RolePermission
                        {
                            RoleId = adminRole.Id,
                            PermissionId = p.Id
                        });
                    }
                }
                await context.SaveChangesAsync();
            }

            // 4. Seed Default Admin User (if none exist)
            var adminUser = await userManager.FindByEmailAsync("admin@realestate.com");
            if (adminUser == null)
            {
                adminUser = new User
                {
                    UserName = "admin@realestate.com",
                    Email = "admin@realestate.com",
                    FirstName = "System",
                    LastName = "Administrator",
                    EmailConfirmed = true,
                    Role = "Admin",
                    IsVerified = true
                };

                var createRes = await userManager.CreateAsync(adminUser, "Admin123!");
                if (createRes.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");

                    // Seed admin profile
                    var adminProfile = new Profile
                    {
                        Id = adminUser.Id,
                        FirstName = "System",
                        LastName = "Administrator",
                        Language = "en",
                        Timezone = "UTC"
                    };
                    context.Profiles.Add(adminProfile);
                    await context.SaveChangesAsync();
                }
            }

            // Ensure maheshnanera3204@gmail.com has Admin role
            var maheshUser = await userManager.FindByEmailAsync("maheshnanera3204@gmail.com");
            if (maheshUser != null)
            {
                if (!await userManager.IsInRoleAsync(maheshUser, "Admin"))
                {
                    await userManager.AddToRoleAsync(maheshUser, "Admin");
                }
                
                maheshUser.Role = "Admin";
                var adminRoleObj = await roleManager.FindByNameAsync("Admin");
                if (adminRoleObj != null && !maheshUser.ActiveRoleId.HasValue)
                {
                    maheshUser.ActiveRoleId = adminRoleObj.Id;
                }
                await userManager.UpdateAsync(maheshUser);

                // Also make sure their profile is seeded/updated if needed
                var profileExists = await context.Profiles.AnyAsync(p => p.Id == maheshUser.Id);
                if (!profileExists)
                {
                    var maheshProfile = new Profile
                    {
                        Id = maheshUser.Id,
                        FirstName = maheshUser.FirstName,
                        LastName = maheshUser.LastName,
                        Language = "en",
                        Timezone = "UTC"
                    };
                    context.Profiles.Add(maheshProfile);
                    await context.SaveChangesAsync();
                }
            }

            // 5. Seed Geographical Locations
            if (!await context.Countries.AnyAsync())
            {
                var usa = new Country { Name = "United States", Code = "USA" };
                context.Countries.Add(usa);

                var ca = new State { Country = usa, Name = "California" };
                var ny = new State { Country = usa, Name = "New York" };
                context.States.AddRange(ca, ny);

                var la = new City { State = ca, Name = "Los Angeles" };
                var sf = new City { State = ca, Name = "San Francisco" };
                var nyc = new City { State = ny, Name = "New York City" };
                context.Cities.AddRange(la, sf, nyc);

                var bh = new Area { City = la, Name = "Beverly Hills" };
                var sm = new Area { City = la, Name = "Santa Monica" };
                var soma = new Area { City = sf, Name = "SOMA" };
                var wms = new Area { City = nyc, Name = "Williamsburg" };
                context.Areas.AddRange(bh, sm, soma, wms);

                await context.SaveChangesAsync();
            }

            // 6. Seed Property Taxonomies
            if (!await context.PropertyCategories.AnyAsync())
            {
                var res = new PropertyCategory { Name = "Residential", Slug = "residential", DisplayOrder = 1 };
                var com = new PropertyCategory { Name = "Commercial", Slug = "commercial", DisplayOrder = 2 };
                var land = new PropertyCategory { Name = "Land", Slug = "land", DisplayOrder = 3 };
                context.PropertyCategories.AddRange(res, com, land);

                // Types
                context.PropertyTypes.AddRange(
                    new PropertyType { Category = res, Name = "Single Family Home", Slug = "single-family", DisplayOrder = 1 },
                    new PropertyType { Category = res, Name = "Apartment", Slug = "apartment", DisplayOrder = 2 },
                    new PropertyType { Category = res, Name = "Condo", Slug = "condo", DisplayOrder = 3 },
                    new PropertyType { Category = com, Name = "Office", Slug = "office", DisplayOrder = 1 },
                    new PropertyType { Category = com, Name = "Retail", Slug = "retail", DisplayOrder = 2 }
                );

                // Statuses
                context.PropertyStatuses.AddRange(
                    new PropertyStatus { Name = "For Sale", DisplayOrder = 1 },
                    new PropertyStatus { Name = "For Rent", DisplayOrder = 2 },
                    new PropertyStatus { Name = "Sold", DisplayOrder = 3 }
                );

                // Conditions
                context.PropertyConditions.AddRange(
                    new PropertyCondition { Name = "New Construction" },
                    new PropertyCondition { Name = "Excellent Condition" },
                    new PropertyCondition { Name = "Needs Renovation" }
                );

                // Amenities
                context.Amenities.AddRange(
                    new Amenity { Name = "Swimming Pool", Slug = "pool", Category = "Outdoor", DisplayOrder = 1 },
                    new Amenity { Name = "Gym / Fitness Center", Slug = "gym", Category = "Indoor", DisplayOrder = 2 },
                    new Amenity { Name = "Garage Parking", Slug = "garage", Category = "Outdoor", DisplayOrder = 3 },
                    new Amenity { Name = "Security System", Slug = "security", Category = "Indoor", DisplayOrder = 4 }
                );

                await context.SaveChangesAsync();
            }
        }
    }
}
