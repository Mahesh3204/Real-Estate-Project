using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.MasterData.Queries
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class PropertyTypeDto
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class StatusDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class ConditionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class AmenityDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? IconUrl { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }

    // Queries
    public class GetCategoriesQuery : IRequest<List<CategoryDto>>
    {
        public bool IncludeInactive { get; set; } = false;
        public bool IncludeDeleted { get; set; } = false;
    }

    public class GetPropertyTypesQuery : IRequest<List<PropertyTypeDto>>
    {
        public Guid? CategoryId { get; set; }
        public bool IncludeInactive { get; set; } = false;
    }

    public class GetStatusesQuery : IRequest<List<StatusDto>>
    {
        public bool IncludeInactive { get; set; } = false;
    }

    public class GetConditionsQuery : IRequest<List<ConditionDto>>
    {
    }

    public class GetAmenitiesQuery : IRequest<List<AmenityDto>>
    {
        public bool IncludeInactive { get; set; } = false;
        public bool IncludeDeleted { get; set; } = false;
    }

    // Handlers
    public class GetMasterDataQueriesHandler :
        IRequestHandler<GetCategoriesQuery, List<CategoryDto>>,
        IRequestHandler<GetPropertyTypesQuery, List<PropertyTypeDto>>,
        IRequestHandler<GetStatusesQuery, List<StatusDto>>,
        IRequestHandler<GetConditionsQuery, List<ConditionDto>>,
        IRequestHandler<GetAmenitiesQuery, List<AmenityDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetMasterDataQueriesHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
        {
            var query = request.IncludeDeleted 
                ? _context.PropertyCategories.IgnoreQueryFilters().AsNoTracking()
                : _context.PropertyCategories.AsNoTracking();

            if (!request.IncludeInactive)
            {
                query = query.Where(c => c.IsActive);
            }

            return await query
                .OrderBy(c => c.DisplayOrder).ThenBy(c => c.Name)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description,
                    ImageUrl = c.ImageUrl,
                    DisplayOrder = c.DisplayOrder,
                    IsActive = c.IsActive
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<List<PropertyTypeDto>> Handle(GetPropertyTypesQuery request, CancellationToken cancellationToken)
        {
            var query = _context.PropertyTypes.Include(t => t.Category).AsNoTracking();

            if (request.CategoryId.HasValue)
            {
                query = query.Where(t => t.CategoryId == request.CategoryId.Value);
            }

            if (!request.IncludeInactive)
            {
                query = query.Where(t => t.IsActive);
            }

            return await query
                .OrderBy(t => t.DisplayOrder).ThenBy(t => t.Name)
                .Select(t => new PropertyTypeDto
                {
                    Id = t.Id,
                    CategoryId = t.CategoryId,
                    CategoryName = t.Category.Name,
                    Name = t.Name,
                    Slug = t.Slug,
                    Description = t.Description,
                    DisplayOrder = t.DisplayOrder,
                    IsActive = t.IsActive
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<List<StatusDto>> Handle(GetStatusesQuery request, CancellationToken cancellationToken)
        {
            var query = _context.PropertyStatuses.AsNoTracking();

            if (!request.IncludeInactive)
            {
                query = query.Where(s => s.IsActive);
            }

            return await query
                .OrderBy(s => s.DisplayOrder).ThenBy(s => s.Name)
                .Select(s => new StatusDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    IsActive = s.IsActive,
                    DisplayOrder = s.DisplayOrder
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<List<ConditionDto>> Handle(GetConditionsQuery request, CancellationToken cancellationToken)
        {
            return await _context.PropertyConditions
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new ConditionDto
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<List<AmenityDto>> Handle(GetAmenitiesQuery request, CancellationToken cancellationToken)
        {
            var query = request.IncludeDeleted 
                ? _context.Amenities.IgnoreQueryFilters().AsNoTracking()
                : _context.Amenities.AsNoTracking();

            if (!request.IncludeInactive)
            {
                query = query.Where(a => a.IsActive);
            }

            return await query
                .OrderBy(a => a.DisplayOrder).ThenBy(a => a.Name)
                .Select(a => new AmenityDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Slug = a.Slug,
                    IconUrl = a.IconUrl,
                    Category = a.Category,
                    Description = a.Description,
                    DisplayOrder = a.DisplayOrder,
                    IsActive = a.IsActive
                })
                .ToListAsync(cancellationToken);
        }
    }
}
