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

namespace RealEstate.Application.History.Queries.GetRecentlyViewed
{
    public class GetRecentlyViewedPropertiesQuery : IRequest<List<PropertyDto>>
    {
        public Guid UserId { get; set; }
        public int Count { get; set; } = 10;
    }

    public class GetRecentlyViewedPropertiesQueryHandler : IRequestHandler<GetRecentlyViewedPropertiesQuery, List<PropertyDto>>
    {
        private readonly IRecentlyViewedService _recentlyViewedService;
        private readonly IApplicationDbContext _context;

        public GetRecentlyViewedPropertiesQueryHandler(IRecentlyViewedService recentlyViewedService, IApplicationDbContext context)
        {
            _recentlyViewedService = recentlyViewedService;
            _context = context;
        }

        public async Task<List<PropertyDto>> Handle(GetRecentlyViewedPropertiesQuery request, CancellationToken cancellationToken)
        {
            // 1. Get history property IDs from cache/redis/database
            var propertyIds = await _recentlyViewedService.GetHistoryAsync(request.UserId);
            if (propertyIds == null || !propertyIds.Any())
            {
                return new List<PropertyDto>();
            }

            // Take matching count limit
            var targetIds = propertyIds.Take(request.Count).ToList();

            // 2. Fetch properties from database
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
                .Where(p => targetIds.Contains(p.Id) && p.PublishStatus == PublishStatus.Published)
                .ToListAsync(cancellationToken);

            // 3. Re-order properties to match targetIds (most recent first)
            var orderedList = targetIds
                .Select(id => properties.FirstOrDefault(p => p.Id == id))
                .Where(p => p != null)
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
                .ToList();

            return orderedList;
        }
    }
}
