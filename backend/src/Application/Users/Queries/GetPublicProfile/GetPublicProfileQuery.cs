using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Properties.Queries;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Users.Queries.GetPublicProfile
{
    public class PublicProfileDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Role { get; set; }
        public List<PropertyDto> Listings { get; set; } = new();
    }

    public class GetPublicProfileQuery : IRequest<PublicProfileDto?>
    {
        public Guid UserId { get; set; }
    }

    public class GetPublicProfileQueryHandler : IRequestHandler<GetPublicProfileQuery, PublicProfileDto?>
    {
        private readonly UserManager<User> _userManager;
        private readonly IApplicationDbContext _context;

        public GetPublicProfileQueryHandler(UserManager<User> userManager, IApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<PublicProfileDto?> Handle(GetPublicProfileQuery request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null)
            {
                return null;
            }

            var profile = await _context.Profiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == request.UserId, cancellationToken);

            var publicProfile = new PublicProfileDto
            {
                Id = user.Id,
                FirstName = profile?.FirstName ?? user.FirstName,
                LastName = profile?.LastName ?? user.LastName,
                Email = user.Email,
                Phone = profile?.Phone ?? user.PhoneNumber,
                AvatarUrl = profile?.AvatarUrl ?? user.ProfilePictureUrl,
                Role = user.Role
            };

            // Fetch active published listings for this user
            var listings = await _context.Properties
                .Include(p => p.Owner)
                .Include(p => p.Category)
                .Include(p => p.PropertyType)
                .Include(p => p.Status)
                .Include(p => p.Condition)
                .Include(p => p.City)
                .Include(p => p.City.State)
                .Include(p => p.City.State.Country)
                .Include(p => p.Media)
                .AsNoTracking()
                .Where(p => p.OwnerId == request.UserId && p.PublishStatus == PublishStatus.Published)
                .OrderByDescending(p => p.CreatedDate)
                .Select(p => new PropertyDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Slug = p.Slug,
                    Description = p.Description,
                    ShortDescription = p.ShortDescription,
                    Price = p.Price,
                    ListingType = p.ListingType,
                    PublishStatus = p.PublishStatus,
                    OwnerId = p.OwnerId,
                    OwnerName = p.Owner != null ? p.Owner.FirstName + " " + p.Owner.LastName : string.Empty,
                    CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                    PropertyTypeName = p.PropertyType != null ? p.PropertyType.Name : string.Empty,
                    StatusName = p.Status != null ? p.Status.Name : string.Empty,
                    ConditionName = p.Condition != null ? p.Condition.Name : string.Empty,
                    CreatedDate = p.CreatedDate,
                    Address = p.Address,
                    FeaturedImageUrl = p.Media.Where(m => m.IsFeatured).Select(m => m.FilePath).FirstOrDefault() ?? p.Media.OrderBy(m => m.DisplayOrder).Select(m => m.FilePath).FirstOrDefault(),
                    CountryName = p.City != null && p.City.State != null && p.City.State.Country != null ? p.City.State.Country.Name : string.Empty,
                    StateName = p.City != null && p.City.State != null ? p.City.State.Name : string.Empty,
                    CityName = p.City != null ? p.City.Name : string.Empty,
                    AreaText = p.AreaText
                })
                .ToListAsync(cancellationToken);

            publicProfile.Listings = listings;
            return publicProfile;
        }
    }
}
