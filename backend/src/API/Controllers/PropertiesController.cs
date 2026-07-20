using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Properties.Commands;
using RealEstate.Application.Properties.Queries;
using RealEstate.API.Middleware;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.API.Controllers
{
    [Route("api/v1/properties")]
    [Authorize]
    public class PropertiesController : ApiControllerBase
    {
        private readonly IFileUploadService _fileUploadService;
        private readonly IApplicationDbContext _context;

        public PropertiesController(IFileUploadService fileUploadService, IApplicationDbContext context)
        {
            _fileUploadService = fileUploadService;
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<PaginatedList<PropertyDto>>> GetProperties([FromQuery] GetPropertyListQuery query)
        {
            query.RequesterUserId = CurrentUserIdOptional;
            query.RequesterRole = CurrentUserRole;
            var result = await Mediator.Send(query);
            return Ok(new { Success = true, Data = result });
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<PropertyDetailsDto>> GetPropertyById(Guid id)
        {
            var query = new GetPropertyDetailsQuery
            {
                Id = id,
                RequesterUserId = CurrentUserIdOptional,
                RequesterRole = CurrentUserRole
            };
            var result = await Mediator.Send(query);
            return Ok(new { Success = true, Data = result });
        }

        [HttpGet("{id}/related")]
        [AllowAnonymous]
        public async Task<ActionResult<List<PropertyDto>>> GetRelatedProperties(Guid id, [FromQuery] int count = 3)
        {
            var result = await Mediator.Send(new GetRelatedPropertiesQuery { PropertyId = id, Count = count });
            return Ok(new { Success = true, Data = result });
        }

        [HttpGet("slug/{slug}")]
        [AllowAnonymous]
        public async Task<ActionResult<PropertyDetailsDto>> GetPropertyBySlug(string slug)
        {
            var query = new GetPropertyDetailsQuery
            {
                Slug = slug,
                RequesterUserId = CurrentUserIdOptional,
                RequesterRole = CurrentUserRole
            };
            var result = await Mediator.Send(query);
            return Ok(new { Success = true, Data = result });
        }

        [HttpPost("draft")]
        public async Task<IActionResult> CreateDraft(CreatePropertyDraftCommand command)
        {
            command.OwnerId = CurrentUserId;
            var id = await Mediator.Send(command);
            return Ok(new { Success = true, Data = new { Id = id } });
        }

        [HttpPut("draft/{id}")]
        public async Task<IActionResult> UpdateDraft(Guid id, UpdatePropertyDraftCommand command)
        {
            if (id != command.Id) return BadRequest("Property ID mismatch.");

            command.RequesterUserId = CurrentUserId;
            command.RequesterRole = CurrentUserRole ?? string.Empty;

            var success = await Mediator.Send(command);
            return Ok(new { Success = success, Message = "Draft autosaved successfully." });
        }

        [HttpPost("{id}/submit")]
        public async Task<IActionResult> SubmitForApproval(Guid id)
        {
            var command = new SubmitPropertyForApprovalCommand
            {
                Id = id,
                RequesterUserId = CurrentUserId,
                RequesterRole = CurrentUserRole ?? string.Empty
            };
            var success = await Mediator.Send(command);
            return Ok(new { Success = success, Message = "Property submitted for moderation review." });
        }

        [HttpPost("bulk-action")]
        public async Task<IActionResult> BulkAction(BulkPropertyActionCommand command)
        {
            command.RequesterUserId = CurrentUserId;
            command.RequesterRole = CurrentUserRole ?? string.Empty;
            var success = await Mediator.Send(command);
            return Ok(new { Success = success, Message = "Bulk action executed successfully." });
        }

        // --- File Managers ---

        [HttpPost("{id}/media")]
        public async Task<IActionResult> UploadMedia(Guid id, IFormFile file, [FromForm] bool isFeatured = false)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            try
            {
                using (var stream = file.OpenReadStream())
                {
                    string subFolder = $"properties/{id}/media";
                    string filePath = await _fileUploadService.UploadFileAsync(stream, file.FileName, file.ContentType, subFolder);

                    string fileType = file.ContentType.StartsWith("video/") ? "Video" : "Image";

                    var command = new AddPropertyMediaCommand
                    {
                        PropertyId = id,
                        FilePath = filePath,
                        FileType = fileType,
                        IsFeatured = isFeatured,
                        RequesterUserId = CurrentUserId,
                        RequesterRole = CurrentUserRole ?? string.Empty
                    };

                    var mediaDto = await Mediator.Send(command);
                    return Ok(new { Success = true, Data = mediaDto });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        [HttpDelete("{id}/media/{mediaId}")]
        public async Task<IActionResult> DeleteMedia(Guid id, Guid mediaId)
        {
            var command = new DeletePropertyMediaCommand
            {
                PropertyId = id,
                MediaId = mediaId,
                RequesterUserId = CurrentUserId,
                RequesterRole = CurrentUserRole ?? string.Empty
            };

            var filePath = await Mediator.Send(command);
            _fileUploadService.DeleteFile(filePath);

            return Ok(new { Success = true, Message = "Media asset deleted successfully." });
        }

        [HttpPut("{id}/media/order")]
        public async Task<IActionResult> UpdateMediaOrder(Guid id, UpdatePropertyMediaOrderCommand command)
        {
            if (id != command.PropertyId) return BadRequest("Property ID mismatch.");

            command.RequesterUserId = CurrentUserId;
            command.RequesterRole = CurrentUserRole ?? string.Empty;

            var success = await Mediator.Send(command);
            return Ok(new { Success = success, Message = "Media arrangement saved." });
        }

        [HttpPost("{id}/documents")]
        public async Task<IActionResult> UploadDocument(Guid id, IFormFile file, [FromForm] string displayName, [FromForm] bool isPublic = true)
        {
            if (file == null || file.Length == 0) return BadRequest("No document uploaded.");

            try
            {
                using (var stream = file.OpenReadStream())
                {
                    string subFolder = $"properties/{id}/documents";
                    string filePath = await _fileUploadService.UploadFileAsync(stream, file.FileName, file.ContentType, subFolder);

                    var command = new AddPropertyDocumentCommand
                    {
                        PropertyId = id,
                        FilePath = filePath,
                        DisplayName = string.IsNullOrWhiteSpace(displayName) ? file.FileName : displayName,
                        IsPublic = isPublic,
                        RequesterUserId = CurrentUserId,
                        RequesterRole = CurrentUserRole ?? string.Empty
                    };

                    var docDto = await Mediator.Send(command);
                    return Ok(new { Success = true, Data = docDto });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        [HttpDelete("{id}/documents/{docId}")]
        public async Task<IActionResult> DeleteDocument(Guid id, Guid docId)
        {
            var command = new DeletePropertyDocumentCommand
            {
                PropertyId = id,
                DocumentId = docId,
                RequesterUserId = CurrentUserId,
                RequesterRole = CurrentUserRole ?? string.Empty
            };

            var filePath = await Mediator.Send(command);
            _fileUploadService.DeleteFile(filePath);

            return Ok(new { Success = true, Message = "Document attachment deleted." });
        }

        [HttpGet("{id}/documents/{docId}/download")]
        [AllowAnonymous]
        public async Task<IActionResult> DownloadDocument(Guid id, Guid docId)
        {
            var doc = await _context.PropertyDocuments
                .Include(d => d.Property)
                .FirstOrDefaultAsync(d => d.Id == docId && d.PropertyId == id);

            if (doc == null) return NotFound("Document not found.");

            // Public check
            if (!doc.IsPublic)
            {
                if (CurrentUserRole != "Admin" && doc.Property?.OwnerId != CurrentUserIdOptional)
                {
                    return Forbid();
                }
            }

            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", doc.FilePath.TrimStart('/'));
            if (!System.IO.File.Exists(fullPath)) return NotFound("Document file not found on disk.");

            var bytes = await System.IO.File.ReadAllBytesAsync(fullPath);
            return File(bytes, "application/octet-stream", doc.DisplayName);
        }

        [HttpPost("{id}/floor-plans")]
        public async Task<IActionResult> UploadFloorPlan(Guid id, IFormFile file, [FromForm] string name, [FromForm] string? dimensions)
        {
            if (file == null || file.Length == 0) return BadRequest("No floor plan file uploaded.");

            try
            {
                using (var stream = file.OpenReadStream())
                {
                    string subFolder = $"properties/{id}/floor-plans";
                    string filePath = await _fileUploadService.UploadFileAsync(stream, file.FileName, file.ContentType, subFolder);

                    var command = new AddPropertyFloorPlanCommand
                    {
                        PropertyId = id,
                        FilePath = filePath,
                        Name = string.IsNullOrWhiteSpace(name) ? file.FileName : name,
                        Dimensions = dimensions,
                        RequesterUserId = CurrentUserId,
                        RequesterRole = CurrentUserRole ?? string.Empty
                    };

                    var planDto = await Mediator.Send(command);
                    return Ok(new { Success = true, Data = planDto });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        [HttpDelete("{id}/floor-plans/{planId}")]
        public async Task<IActionResult> DeleteFloorPlan(Guid id, Guid planId)
        {
            var command = new DeletePropertyFloorPlanCommand
            {
                PropertyId = id,
                FloorPlanId = planId,
                RequesterUserId = CurrentUserId,
                RequesterRole = CurrentUserRole ?? string.Empty
            };

            var filePath = await Mediator.Send(command);
            _fileUploadService.DeleteFile(filePath);

            return Ok(new { Success = true, Message = "Floor plan deleted." });
        }

        [HttpPost("{id}/duplicate")]
        public async Task<IActionResult> Duplicate(Guid id)
        {
            var p = await _context.Properties
                .Include(p => p.Amenities)
                .Include(p => p.Media)
                .Include(p => p.Documents)
                .Include(p => p.FloorPlans)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (p == null) return NotFound("Property not found.");

            // Ownership check
            if (CurrentUserRole != "Admin" && p.OwnerId != CurrentUserId)
            {
                return Forbid();
            }

            var duplicate = new Property
            {
                Title = $"{p.Title} (Copy)",
                Description = p.Description,
                ShortDescription = p.ShortDescription,
                Price = p.Price,
                ListingType = p.ListingType,
                CategoryId = p.CategoryId,
                PropertyTypeId = p.PropertyTypeId,
                StatusId = p.StatusId,
                ConditionId = p.ConditionId,
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
                AreaText = p.AreaText,
                Address = p.Address,
                Landmark = p.Landmark,
                ZipCode = p.ZipCode,
                Latitude = p.Latitude,
                Longitude = p.Longitude,
                OwnerId = CurrentUserId,
                PublishStatus = PublishStatus.Draft,
                Slug = $"{p.Slug}-copy-{Guid.NewGuid().ToString("N").Substring(0, 4)}"
            };

            foreach (var m in p.Media)
            {
                duplicate.Media.Add(new PropertyMedia
                {
                    FilePath = m.FilePath,
                    FileType = m.FileType,
                    IsFeatured = m.IsFeatured,
                    DisplayOrder = m.DisplayOrder
                });
            }

            foreach (var d in p.Documents)
            {
                duplicate.Documents.Add(new PropertyDocument
                {
                    FilePath = d.FilePath,
                    DisplayName = d.DisplayName,
                    IsPublic = d.IsPublic
                });
            }

            foreach (var f in p.FloorPlans)
            {
                duplicate.FloorPlans.Add(new PropertyFloorPlan
                {
                    FilePath = f.FilePath,
                    Name = f.Name,
                    Dimensions = f.Dimensions
                });
            }

            foreach (var a in p.Amenities)
            {
                duplicate.Amenities.Add(a);
            }

            _context.Properties.Add(duplicate);

            // Log in audit trail
            var log = new PropertyAuditLog
            {
                PropertyId = duplicate.Id,
                UserId = CurrentUserId,
                OldStatus = PublishStatus.Draft,
                NewStatus = PublishStatus.Draft,
                Notes = $"Duplicated from property listing ID: {p.Id}."
            };
            _context.PropertyAuditLogs.Add(log);

            await _context.SaveChangesAsync();
            return Ok(new { Success = true, Data = new { Id = duplicate.Id } });
        }
    }
}
