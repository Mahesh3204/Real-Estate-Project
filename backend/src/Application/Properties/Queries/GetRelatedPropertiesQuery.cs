using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Properties.Queries
{
    public class GetRelatedPropertiesQuery : IRequest<List<PropertyDto>>
    {
        public Guid PropertyId { get; set; }
        public int Count { get; set; } = 3;
    }

    public class GetRelatedPropertiesQueryHandler : IRequestHandler<GetRelatedPropertiesQuery, List<PropertyDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetRelatedPropertiesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<PropertyDto>> Handle(GetRelatedPropertiesQuery request, CancellationToken cancellationToken)
        {
            // 1. Fetch current property category & type
            var currentProperty = await _context.Properties
                .AsNoTracking()
                .Select(p => new { p.Id, p.CategoryId, p.PropertyTypeId })
                .FirstOrDefaultAsync(p => p.Id == request.PropertyId, cancellationToken);

            if (currentProperty == null)
            {
                return new List<PropertyDto>();
            }

            // 2. Query published properties in the same category
            var query = _context.Properties
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
                .Where(p => p.Id != request.PropertyId && p.PublishStatus == PublishStatus.Published);

            // Favor same property type first, then category
            var related = await query
                .Where(p => p.CategoryId == currentProperty.CategoryId)
                .OrderByDescending(p => p.PropertyTypeId == currentProperty.PropertyTypeId)
                .ThenByDescending(p => p.CreatedDate)
                .Take(request.Count)
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

            return related;
        }
    }
}
