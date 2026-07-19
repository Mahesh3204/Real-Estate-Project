using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Properties.Queries
{
    public class PropertyDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ShortDescription { get; set; }
        public decimal Price { get; set; }
        public ListingType ListingType { get; set; }
        public PublishStatus PublishStatus { get; set; }
        public Guid OwnerId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string PropertyTypeName { get; set; } = string.Empty;
        public string StatusName { get; set; } = string.Empty;
        public string ConditionName { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public string? Address { get; set; }
        public string? FeaturedImageUrl { get; set; }
        public string CountryName { get; set; } = string.Empty;
        public string StateName { get; set; } = string.Empty;
        public string CityName { get; set; } = string.Empty;
        public string? AreaText { get; set; }
    }

    public class PropertyDetailsDto : PropertyDto
    {
        public int? Bedrooms { get; set; }
        public int? Bathrooms { get; set; }
        public int? Balconies { get; set; }
        public int? Floors { get; set; }
        public int? Parking { get; set; }
        public decimal? Area { get; set; }
        public string? AreaUnit { get; set; }
        public decimal? LotSize { get; set; }
        public string? FurnishedStatus { get; set; }
        public int? YearBuilt { get; set; }
        public string? FacingDirection { get; set; }

        public Guid? CountryId { get; set; }
        public Guid? StateId { get; set; }
        public Guid? CityId { get; set; }
        public Guid? CategoryId { get; set; }
        public Guid? PropertyTypeId { get; set; }
        public Guid? StatusId { get; set; }
        public Guid? ConditionId { get; set; }

        public string? Landmark { get; set; }
        public string? ZipCode { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string? MetaKeywords { get; set; }

        public List<Guid> AmenityIds { get; set; } = new();
        public List<PropertyMediaDto> Media { get; set; } = new();
        public List<PropertyDocumentDto> Documents { get; set; } = new();
        public List<PropertyFloorPlanDto> FloorPlans { get; set; } = new();
        public List<PropertyAuditLogDto> AuditLogs { get; set; } = new();
    }

    public class PropertyMediaDto
    {
        public Guid Id { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public bool IsFeatured { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class PropertyDocumentDto
    {
        public Guid Id { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
    }

    public class PropertyFloorPlanDto
    {
        public Guid Id { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Dimensions { get; set; }
    }

    public class PropertyAuditLogDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserEmail { get; set; } = string.Empty;
        public string OldStatus { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class PaginatedList<T>
    {
        public List<T> Items { get; }
        public int PageNumber { get; }
        public int PageSize { get; }
        public int TotalRecords { get; }
        public int TotalPages { get; }

        public PaginatedList(List<T> items, int count, int pageNumber, int pageSize)
        {
            PageNumber = pageNumber;
            PageSize = pageSize;
            TotalRecords = count;
            TotalPages = (int)Math.Ceiling(count / (double)pageSize);
            Items = items;
        }
    }

    public class GetPropertyListQuery : IRequest<PaginatedList<PropertyDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchQuery { get; set; }
        public Guid? CategoryId { get; set; }
        public Guid? PropertyTypeId { get; set; }
        public Guid? StatusId { get; set; }
        public Guid? ConditionId { get; set; }
        public PublishStatus? PublishStatus { get; set; }
        public ListingType? ListingType { get; set; }
        public bool OnlyOwner { get; set; } = false;
        public string SortBy { get; set; } = "newest";

        // Context parameter passed from Controller
        public Guid? RequesterUserId { get; set; }
        public string? RequesterRole { get; set; }
    }

    public class GetPropertyDetailsQuery : IRequest<PropertyDetailsDto>
    {
        public Guid? Id { get; set; }
        public string? Slug { get; set; }
        public Guid? RequesterUserId { get; set; }
        public string? RequesterRole { get; set; }
    }

    public class GetPropertiesQueriesHandler :
        IRequestHandler<GetPropertyListQuery, PaginatedList<PropertyDto>>,
        IRequestHandler<GetPropertyDetailsQuery, PropertyDetailsDto>
    {
        private readonly IApplicationDbContext _context;

        public GetPropertiesQueriesHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedList<PropertyDto>> Handle(GetPropertyListQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Properties
                .Include(p => p.Owner)
                .Include(p => p.Category)
                .Include(p => p.PropertyType)
                .Include(p => p.Status)
                .Include(p => p.Condition)
                .Include(p => p.Country)
                .Include(p => p.State)
                .Include(p => p.City)
                .Include(p => p.Media)
                .AsNoTracking();

            // Status visibility rules: Non-published listings can only be retrieved by owner or admin
            if (request.RequesterRole != "Admin")
            {
                if (request.RequesterUserId.HasValue)
                {
                    // Filter: requester can see their own listings of any status, but only published listings from others
                    query = query.Where(p => p.PublishStatus == PublishStatus.Published || p.OwnerId == request.RequesterUserId.Value);
                }
                else
                {
                    // Anonymous user can only see Published properties
                    query = query.Where(p => p.PublishStatus == PublishStatus.Published);
                }
            }

            // Filters
            if (request.OnlyOwner && request.RequesterUserId.HasValue)
            {
                query = query.Where(p => p.OwnerId == request.RequesterUserId.Value);
            }

            if (request.CategoryId.HasValue)
                query = query.Where(p => p.CategoryId == request.CategoryId.Value);

            if (request.PropertyTypeId.HasValue)
                query = query.Where(p => p.PropertyTypeId == request.PropertyTypeId.Value);

            if (request.StatusId.HasValue)
                query = query.Where(p => p.StatusId == request.StatusId.Value);

            if (request.ConditionId.HasValue)
                query = query.Where(p => p.ConditionId == request.ConditionId.Value);

            if (request.PublishStatus.HasValue)
                query = query.Where(p => p.PublishStatus == request.PublishStatus.Value);

            if (request.ListingType.HasValue)
                query = query.Where(p => p.ListingType == request.ListingType.Value);

            if (!string.IsNullOrWhiteSpace(request.SearchQuery))
            {
                var term = request.SearchQuery.ToLower();
                query = query.Where(p => p.Title.ToLower().Contains(term) ||
                                         (p.Description != null && p.Description.ToLower().Contains(term)) ||
                                         (p.Address != null && p.Address.ToLower().Contains(term)));
            }

            // Sorting
            query = request.SortBy.ToLower() switch
            {
                "price_asc" => query.OrderBy(p => p.Price),
                "price_desc" => query.OrderByDescending(p => p.Price),
                "oldest" => query.OrderBy(p => p.CreatedDate),
                _ => query.OrderByDescending(p => p.CreatedDate)
            };

            int totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(p => new PropertyDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Slug = p.Slug ?? string.Empty,
                    Description = p.Description,
                    ShortDescription = p.ShortDescription,
                    Price = p.Price,
                    ListingType = p.ListingType,
                    PublishStatus = p.PublishStatus,
                    OwnerId = p.OwnerId,
                    OwnerName = p.Owner != null ? $"{p.Owner.FirstName} {p.Owner.LastName}" : "System",
                    CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                    PropertyTypeName = p.PropertyType != null ? p.PropertyType.Name : string.Empty,
                    StatusName = p.Status != null ? p.Status.Name : string.Empty,
                    ConditionName = p.Condition != null ? p.Condition.Name : string.Empty,
                    CreatedDate = p.CreatedDate,
                    Address = p.Address,
                    CountryName = p.Country != null ? p.Country.Name : string.Empty,
                    StateName = p.State != null ? p.State.Name : string.Empty,
                    CityName = p.City != null ? p.City.Name : string.Empty,
                    AreaText = p.AreaText,
                    FeaturedImageUrl = p.Media.Where(m => m.IsFeatured).Select(m => m.FilePath).FirstOrDefault() ??
                                       p.Media.OrderBy(m => m.DisplayOrder).Select(m => m.FilePath).FirstOrDefault()
                })
                .ToListAsync(cancellationToken);

            return new PaginatedList<PropertyDto>(items, totalCount, request.PageNumber, request.PageSize);
        }

        public async Task<PropertyDetailsDto> Handle(GetPropertyDetailsQuery request, CancellationToken cancellationToken)
        {
            var p = await _context.Properties
                .Include(p => p.Owner)
                .Include(p => p.Category)
                .Include(p => p.PropertyType)
                .Include(p => p.Status)
                .Include(p => p.Condition)
                .Include(p => p.Country)
                .Include(p => p.State)
                .Include(p => p.City)
                .Include(p => p.Amenities)
                .Include(p => p.Media)
                .Include(p => p.Documents)
                .Include(p => p.FloorPlans)
                .Include(p => p.AuditLogs)
                    .ThenInclude(l => l.User)
                .FirstOrDefaultAsync(x => (request.Id.HasValue && x.Id == request.Id.Value) ||
                                          (!request.Id.HasValue && x.Slug == request.Slug), cancellationToken);

            if (p == null)
            {
                throw new KeyNotFoundException("Property listing not found.");
            }

            // Authorization rules: non-published listing access constraint
            if (p.PublishStatus != PublishStatus.Published)
            {
                if (request.RequesterRole != "Admin" && p.OwnerId != request.RequesterUserId)
                {
                    throw new UnauthorizedAccessException("You are not authorized to view this property draft listing.");
                }
            }

            var isOwnerOrAdmin = request.RequesterRole == "Admin" || p.OwnerId == request.RequesterUserId;

            // Map detail DTO
            var details = new PropertyDetailsDto
            {
                Id = p.Id,
                Title = p.Title,
                Slug = p.Slug ?? string.Empty,
                Description = p.Description,
                ShortDescription = p.ShortDescription,
                Price = p.Price,
                ListingType = p.ListingType,
                PublishStatus = p.PublishStatus,
                OwnerId = p.OwnerId,
                OwnerName = p.Owner != null ? $"{p.Owner.FirstName} {p.Owner.LastName}" : "System",
                CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                PropertyTypeName = p.PropertyType != null ? p.PropertyType.Name : string.Empty,
                StatusName = p.Status != null ? p.Status.Name : string.Empty,
                ConditionName = p.Condition != null ? p.Condition.Name : string.Empty,
                CreatedDate = p.CreatedDate,
                Address = p.Address,
                CountryName = p.Country != null ? p.Country.Name : string.Empty,
                StateName = p.State != null ? p.State.Name : string.Empty,
                CityName = p.City != null ? p.City.Name : string.Empty,
                AreaText = p.AreaText,
                Bedrooms = p.Bedrooms,
                Bathrooms = p.Bathrooms,
                Balconies = p.Balconies,
                Floors = p.Floors,
                Parking = p.Parking,
                Area = p.Area,
                AreaUnit = p.AreaUnit,
                LotSize = p.LotSize,
                FurnishedStatus = p.FurnishedStatus,
                YearBuilt = p.YearBuilt,
                FacingDirection = p.FacingDirection,
                CountryId = p.CountryId,
                StateId = p.StateId,
                CityId = p.CityId,
                CategoryId = p.CategoryId,
                PropertyTypeId = p.PropertyTypeId,
                StatusId = p.StatusId,
                ConditionId = p.ConditionId,
                Landmark = p.Landmark,
                ZipCode = p.ZipCode,
                Latitude = p.Latitude,
                Longitude = p.Longitude,
                MetaTitle = p.MetaTitle,
                MetaDescription = p.MetaDescription,
                MetaKeywords = p.MetaKeywords,
                FeaturedImageUrl = p.Media.Where(m => m.IsFeatured).Select(m => m.FilePath).FirstOrDefault() ??
                                   p.Media.OrderBy(m => m.DisplayOrder).Select(m => m.FilePath).FirstOrDefault(),

                AmenityIds = p.Amenities.Select(a => a.Id).ToList(),

                Media = p.Media.OrderBy(m => m.DisplayOrder).Select(m => new PropertyMediaDto
                {
                    Id = m.Id,
                    FilePath = m.FilePath,
                    FileType = m.FileType,
                    IsFeatured = m.IsFeatured,
                    DisplayOrder = m.DisplayOrder
                }).ToList(),

                // Document privacy filter constraint: only owner/admin can download/see private documents
                Documents = p.Documents.Where(d => d.IsPublic || isOwnerOrAdmin).Select(d => new PropertyDocumentDto
                {
                    Id = d.Id,
                    FilePath = d.FilePath,
                    DisplayName = d.DisplayName,
                    IsPublic = d.IsPublic
                }).ToList(),

                FloorPlans = p.FloorPlans.Select(f => new PropertyFloorPlanDto
                {
                    Id = f.Id,
                    FilePath = f.FilePath,
                    Name = f.Name,
                    Dimensions = f.Dimensions
                }).ToList(),

                // AuditLogs visibility constraints: only owner/admin can review auditing log notes
                AuditLogs = isOwnerOrAdmin ? p.AuditLogs.OrderByDescending(l => l.CreatedDate).Select(l => new PropertyAuditLogDto
                {
                    Id = l.Id,
                    UserId = l.UserId,
                    UserEmail = l.User != null ? l.User.Email ?? string.Empty : "System",
                    OldStatus = l.OldStatus.ToString(),
                    NewStatus = l.NewStatus.ToString(),
                    Notes = l.Notes,
                    CreatedDate = l.CreatedDate
                }).ToList() : new List<PropertyAuditLogDto>()
            };

            return details;
        }
    }
}
