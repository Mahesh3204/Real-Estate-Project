using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Properties.Queries;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Favorites.Queries.GetFavorites
{
    public class GetFavoritesPropertiesQuery : IRequest<List<PropertyDto>>
    {
        public Guid UserId { get; set; }
    }

    public class GetFavoritesPropertiesQueryHandler : IRequestHandler<GetFavoritesPropertiesQuery, List<PropertyDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetFavoritesPropertiesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<PropertyDto>> Handle(GetFavoritesPropertiesQuery request, CancellationToken cancellationToken)
        {
            // 1. Get favorite property IDs
            var propertyIds = await _context.PropertyFavorites
                .AsNoTracking()
                .Where(f => f.UserId == request.UserId)
                .Select(f => f.PropertyId)
                .ToListAsync(cancellationToken);

            if (propertyIds == null || !propertyIds.Any())
            {
                return new List<PropertyDto>();
            }

            // 2. Fetch full property details
            var properties = await _context.Properties
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
                .Where(p => propertyIds.Contains(p.Id) && p.PublishStatus == PublishStatus.Published)
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

            return properties;
        }
    }
}
