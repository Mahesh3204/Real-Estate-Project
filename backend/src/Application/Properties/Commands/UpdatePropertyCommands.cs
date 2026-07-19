using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Properties.Queries;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Properties.Commands
{
    // Commands
    public class UpdatePropertyDraftCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ShortDescription { get; set; }
        public decimal Price { get; set; }
        public ListingType ListingType { get; set; }

        public Guid? CategoryId { get; set; }
        public Guid? PropertyTypeId { get; set; }
        public Guid? StatusId { get; set; }
        public Guid? ConditionId { get; set; }

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
        public string? AreaText { get; set; }
        public string? Address { get; set; }
        public string? Landmark { get; set; }
        public string? ZipCode { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string? MetaKeywords { get; set; }

        public List<Guid> AmenityIds { get; set; } = new();

        public Guid RequesterUserId { get; set; }
        public string RequesterRole { get; set; } = string.Empty;
    }

    public class SubmitPropertyForApprovalCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public Guid RequesterUserId { get; set; }
        public string RequesterRole { get; set; } = string.Empty;
    }

    public class BulkPropertyActionCommand : IRequest<bool>
    {
        public List<Guid> PropertyIds { get; set; } = new();
        public string Action { get; set; } = string.Empty; // "Archive", "Publish", "Restore", "Delete"
        public Guid RequesterUserId { get; set; }
        public string RequesterRole { get; set; } = string.Empty;
    }

    // Media Commands
    public class AddPropertyMediaCommand : IRequest<PropertyMediaDto>
    {
        public Guid PropertyId { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string FileType { get; set; } = "Image";
        public bool IsFeatured { get; set; }
        public Guid RequesterUserId { get; set; }
        public string RequesterRole { get; set; } = string.Empty;
    }

    public class DeletePropertyMediaCommand : IRequest<string>
    {
        public Guid PropertyId { get; set; }
        public Guid MediaId { get; set; }
        public Guid RequesterUserId { get; set; }
        public string RequesterRole { get; set; } = string.Empty;
    }

    public class UpdatePropertyMediaOrderCommand : IRequest<bool>
    {
        public Guid PropertyId { get; set; }
        public List<Guid> OrderedMediaIds { get; set; } = new();
        public Guid RequesterUserId { get; set; }
        public string RequesterRole { get; set; } = string.Empty;
    }

    // Document Commands
    public class AddPropertyDocumentCommand : IRequest<PropertyDocumentDto>
    {
        public Guid PropertyId { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public Guid RequesterUserId { get; set; }
        public string RequesterRole { get; set; } = string.Empty;
    }

    public class DeletePropertyDocumentCommand : IRequest<string>
    {
        public Guid PropertyId { get; set; }
        public Guid DocumentId { get; set; }
        public Guid RequesterUserId { get; set; }
        public string RequesterRole { get; set; } = string.Empty;
    }

    // Floor Plan Commands
    public class AddPropertyFloorPlanCommand : IRequest<PropertyFloorPlanDto>
    {
        public Guid PropertyId { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Dimensions { get; set; }
        public Guid RequesterUserId { get; set; }
        public string RequesterRole { get; set; } = string.Empty;
    }

    public class DeletePropertyFloorPlanCommand : IRequest<string>
    {
        public Guid PropertyId { get; set; }
        public Guid FloorPlanId { get; set; }
        public Guid RequesterUserId { get; set; }
        public string RequesterRole { get; set; } = string.Empty;
    }

    // Handlers
    public class UpdatePropertyHandlers : 
        IRequestHandler<UpdatePropertyDraftCommand, bool>,
        IRequestHandler<SubmitPropertyForApprovalCommand, bool>,
        IRequestHandler<BulkPropertyActionCommand, bool>,
        IRequestHandler<AddPropertyMediaCommand, PropertyMediaDto>,
        IRequestHandler<DeletePropertyMediaCommand, string>,
        IRequestHandler<UpdatePropertyMediaOrderCommand, bool>,
        IRequestHandler<AddPropertyDocumentCommand, PropertyDocumentDto>,
        IRequestHandler<DeletePropertyDocumentCommand, string>,
        IRequestHandler<AddPropertyFloorPlanCommand, PropertyFloorPlanDto>,
        IRequestHandler<DeletePropertyFloorPlanCommand, string>
    {
        private readonly IApplicationDbContext _context;

        public UpdatePropertyHandlers(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdatePropertyDraftCommand request, CancellationToken cancellationToken)
        {
            var p = await _context.Properties
                .Include(p => p.Amenities)
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (p == null) throw new KeyNotFoundException("Property not found.");

            // Ownership check
            if (request.RequesterRole != "Admin" && p.OwnerId != request.RequesterUserId)
            {
                throw new UnauthorizedAccessException("You cannot modify another user's property draft.");
            }

            p.Title = request.Title;
            p.Description = request.Description;
            p.ShortDescription = request.ShortDescription;
            p.Price = request.Price;
            p.ListingType = request.ListingType;

            p.CategoryId = request.CategoryId;
            p.PropertyTypeId = request.PropertyTypeId;
            p.StatusId = request.StatusId;
            p.ConditionId = request.ConditionId;

            p.Bedrooms = request.Bedrooms;
            p.Bathrooms = request.Bathrooms;
            p.Balconies = request.Balconies;
            p.Floors = request.Floors;
            p.Parking = request.Parking;
            p.Area = request.Area;
            p.AreaUnit = request.AreaUnit;
            p.LotSize = request.LotSize;
            p.FurnishedStatus = request.FurnishedStatus;
            p.YearBuilt = request.YearBuilt;
            p.FacingDirection = request.FacingDirection;

            p.CountryId = request.CountryId;
            p.StateId = request.StateId;
            p.CityId = request.CityId;
            p.AreaText = request.AreaText;
            p.Address = request.Address;
            p.Landmark = request.Landmark;
            p.ZipCode = request.ZipCode;
            p.Latitude = request.Latitude;
            p.Longitude = request.Longitude;

            p.MetaTitle = request.MetaTitle;
            p.MetaDescription = request.MetaDescription;
            p.MetaKeywords = request.MetaKeywords;

            p.Amenities.Clear();
            if (request.AmenityIds.Any())
            {
                var amenities = await _context.Amenities
                    .Where(a => request.AmenityIds.Contains(a.Id))
                    .ToListAsync(cancellationToken);

                foreach (var amenity in amenities)
                {
                    p.Amenities.Add(amenity);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> Handle(SubmitPropertyForApprovalCommand request, CancellationToken cancellationToken)
        {
            var p = await _context.Properties.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            if (p == null) throw new KeyNotFoundException("Property not found.");

            if (request.RequesterRole != "Admin" && p.OwnerId != request.RequesterUserId)
            {
                throw new UnauthorizedAccessException("You cannot submit another agent's property.");
            }

            var oldStatus = p.PublishStatus;
            p.PublishStatus = PublishStatus.PendingApproval;

            var log = new PropertyAuditLog
            {
                PropertyId = p.Id,
                UserId = request.RequesterUserId,
                OldStatus = oldStatus,
                NewStatus = PublishStatus.PendingApproval,
                Notes = "Submitted property listing for administrator approval."
            };
            _context.PropertyAuditLogs.Add(log);

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> Handle(BulkPropertyActionCommand request, CancellationToken cancellationToken)
        {
            var query = _context.Properties.Where(p => request.PropertyIds.Contains(p.Id));
            if (request.RequesterRole != "Admin")
            {
                query = query.Where(p => p.OwnerId == request.RequesterUserId);
            }

            var properties = await query.ToListAsync(cancellationToken);
            if (!properties.Any()) return false;

            foreach (var p in properties)
            {
                var oldStatus = p.PublishStatus;
                string logNotes = string.Empty;

                switch (request.Action.ToLower())
                {
                    case "archive":
                        p.PublishStatus = PublishStatus.Archived;
                        logNotes = "Bulk action: Archived property.";
                        break;
                    case "publish":
                        p.PublishStatus = PublishStatus.Published;
                        logNotes = "Bulk action: Published property.";
                        break;
                    case "restore":
                        p.PublishStatus = PublishStatus.Draft;
                        logNotes = "Bulk action: Restored property to Draft.";
                        break;
                    case "delete":
                        p.IsDeleted = true;
                        logNotes = "Bulk action: Soft-deleted property.";
                        break;
                    default:
                        continue;
                }

                var log = new PropertyAuditLog
                {
                    PropertyId = p.Id,
                    UserId = request.RequesterUserId,
                    OldStatus = oldStatus,
                    NewStatus = p.PublishStatus,
                    Notes = logNotes
                };
                _context.PropertyAuditLogs.Add(log);
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<PropertyMediaDto> Handle(AddPropertyMediaCommand request, CancellationToken cancellationToken)
        {
            var p = await _context.Properties.FirstOrDefaultAsync(x => x.Id == request.PropertyId, cancellationToken);
            if (p == null) throw new KeyNotFoundException("Property not found.");

            if (request.RequesterRole != "Admin" && p.OwnerId != request.RequesterUserId)
            {
                throw new UnauthorizedAccessException("Unauthorized listing update attempt.");
            }

            // If isFeatured is set, clear existing featured image flags
            if (request.IsFeatured)
            {
                var existingFeatured = await _context.PropertyMedias
                    .Where(m => m.PropertyId == request.PropertyId && m.IsFeatured)
                    .ToListAsync(cancellationToken);

                foreach (var media in existingFeatured)
                {
                    media.IsFeatured = false;
                }
            }

            // Determine display order
            int nextOrder = await _context.PropertyMedias
                .Where(m => m.PropertyId == request.PropertyId)
                .Select(m => (int?)m.DisplayOrder)
                .MaxAsync(cancellationToken) ?? 0;

            var mediaItem = new PropertyMedia
            {
                PropertyId = request.PropertyId,
                FilePath = request.FilePath,
                FileType = request.FileType,
                IsFeatured = request.IsFeatured,
                DisplayOrder = nextOrder + 1
            };

            _context.PropertyMedias.Add(mediaItem);
            await _context.SaveChangesAsync(cancellationToken);

            return new PropertyMediaDto
            {
                Id = mediaItem.Id,
                FilePath = mediaItem.FilePath,
                FileType = mediaItem.FileType,
                IsFeatured = mediaItem.IsFeatured,
                DisplayOrder = mediaItem.DisplayOrder
            };
        }

        public async Task<string> Handle(DeletePropertyMediaCommand request, CancellationToken cancellationToken)
        {
            var m = await _context.PropertyMedias
                .Include(x => x.Property)
                .FirstOrDefaultAsync(x => x.Id == request.MediaId, cancellationToken);

            if (m == null) throw new KeyNotFoundException("Media file not found.");

            if (request.RequesterRole != "Admin" && m.Property?.OwnerId != request.RequesterUserId)
            {
                throw new UnauthorizedAccessException("Unauthorized media deletion attempt.");
            }

            string path = m.FilePath;
            _context.PropertyMedias.Remove(m);
            await _context.SaveChangesAsync(cancellationToken);

            return path;
        }

        public async Task<bool> Handle(UpdatePropertyMediaOrderCommand request, CancellationToken cancellationToken)
        {
            var p = await _context.Properties.FirstOrDefaultAsync(x => x.Id == request.PropertyId, cancellationToken);
            if (p == null) throw new KeyNotFoundException("Property not found.");

            if (request.RequesterRole != "Admin" && p.OwnerId != request.RequesterUserId)
            {
                throw new UnauthorizedAccessException("Unauthorized media ordering update attempt.");
            }

            var medias = await _context.PropertyMedias
                .Where(m => m.PropertyId == request.PropertyId)
                .ToListAsync(cancellationToken);

            for (int i = 0; i < request.OrderedMediaIds.Count; i++)
            {
                var id = request.OrderedMediaIds[i];
                var media = medias.FirstOrDefault(m => m.Id == id);
                if (media != null)
                {
                    media.DisplayOrder = i + 1;
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<PropertyDocumentDto> Handle(AddPropertyDocumentCommand request, CancellationToken cancellationToken)
        {
            var p = await _context.Properties.FirstOrDefaultAsync(x => x.Id == request.PropertyId, cancellationToken);
            if (p == null) throw new KeyNotFoundException("Property not found.");

            if (request.RequesterRole != "Admin" && p.OwnerId != request.RequesterUserId)
            {
                throw new UnauthorizedAccessException("Unauthorized document attachment attempt.");
            }

            var doc = new PropertyDocument
            {
                PropertyId = request.PropertyId,
                FilePath = request.FilePath,
                DisplayName = request.DisplayName,
                IsPublic = request.IsPublic
            };

            _context.PropertyDocuments.Add(doc);
            await _context.SaveChangesAsync(cancellationToken);

            return new PropertyDocumentDto
            {
                Id = doc.Id,
                FilePath = doc.FilePath,
                DisplayName = doc.DisplayName,
                IsPublic = doc.IsPublic
            };
        }

        public async Task<string> Handle(DeletePropertyDocumentCommand request, CancellationToken cancellationToken)
        {
            var d = await _context.PropertyDocuments
                .Include(x => x.Property)
                .FirstOrDefaultAsync(x => x.Id == request.DocumentId, cancellationToken);

            if (d == null) throw new KeyNotFoundException("Document file not found.");

            if (request.RequesterRole != "Admin" && d.Property?.OwnerId != request.RequesterUserId)
            {
                throw new UnauthorizedAccessException("Unauthorized document deletion attempt.");
            }

            string path = d.FilePath;
            _context.PropertyDocuments.Remove(d);
            await _context.SaveChangesAsync(cancellationToken);

            return path;
        }

        public async Task<PropertyFloorPlanDto> Handle(AddPropertyFloorPlanCommand request, CancellationToken cancellationToken)
        {
            var p = await _context.Properties.FirstOrDefaultAsync(x => x.Id == request.PropertyId, cancellationToken);
            if (p == null) throw new KeyNotFoundException("Property not found.");

            if (request.RequesterRole != "Admin" && p.OwnerId != request.RequesterUserId)
            {
                throw new UnauthorizedAccessException("Unauthorized floor plan attachment attempt.");
            }

            var plan = new PropertyFloorPlan
            {
                PropertyId = request.PropertyId,
                FilePath = request.FilePath,
                Name = request.Name,
                Dimensions = request.Dimensions
            };

            _context.PropertyFloorPlans.Add(plan);
            await _context.SaveChangesAsync(cancellationToken);

            return new PropertyFloorPlanDto
            {
                Id = plan.Id,
                FilePath = plan.FilePath,
                Name = plan.Name,
                Dimensions = plan.Dimensions
            };
        }

        public async Task<string> Handle(DeletePropertyFloorPlanCommand request, CancellationToken cancellationToken)
        {
            var f = await _context.PropertyFloorPlans
                .Include(x => x.Property)
                .FirstOrDefaultAsync(x => x.Id == request.FloorPlanId, cancellationToken);

            if (f == null) throw new KeyNotFoundException("Floor plan not found.");

            if (request.RequesterRole != "Admin" && f.Property?.OwnerId != request.RequesterUserId)
            {
                throw new UnauthorizedAccessException("Unauthorized floor plan deletion attempt.");
            }

            string path = f.FilePath;
            _context.PropertyFloorPlans.Remove(f);
            await _context.SaveChangesAsync(cancellationToken);

            return path;
        }
    }
}
