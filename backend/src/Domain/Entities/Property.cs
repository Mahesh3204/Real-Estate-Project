using System;
using System.Collections.Generic;
using RealEstate.Domain.Common;
using RealEstate.Domain.Enums;

namespace RealEstate.Domain.Entities
{
    public class Property : IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ShortDescription { get; set; }
        public decimal Price { get; set; }
        public ListingType ListingType { get; set; } = ListingType.Sale;

        // Taxonomy
        public Guid? CategoryId { get; set; }
        public PropertyCategory? Category { get; set; }

        public Guid? PropertyTypeId { get; set; }
        public PropertyType? PropertyType { get; set; }

        public Guid? StatusId { get; set; }
        public PropertyStatus? Status { get; set; }

        public Guid? ConditionId { get; set; }
        public PropertyCondition? Condition { get; set; }

        // Property Details
        public int? Bedrooms { get; set; }
        public int? Bathrooms { get; set; }
        public int? Balconies { get; set; }
        public int? Floors { get; set; }
        public int? Parking { get; set; }
        public decimal? Area { get; set; }
        public string? AreaUnit { get; set; } // e.g. "sqft"
        public decimal? LotSize { get; set; }
        public string? FurnishedStatus { get; set; } // e.g. "Furnished"
        public int? YearBuilt { get; set; }
        public string? FacingDirection { get; set; }

        // Location Details
        public Guid? CountryId { get; set; }
        public Country? Country { get; set; }

        public Guid? StateId { get; set; }
        public State? State { get; set; }

        public Guid? CityId { get; set; }
        public City? City { get; set; }

        public string? AreaText { get; set; } // Area free text
        public string? Address { get; set; }
        public string? Landmark { get; set; }
        public string? ZipCode { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        // SEO Details
        public string? Slug { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string? MetaKeywords { get; set; }

        // Security & Status
        public Guid OwnerId { get; set; }
        public User? Owner { get; set; }

        public PublishStatus PublishStatus { get; set; } = PublishStatus.Draft;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;

        // Navigation Collections
        public ICollection<PropertyMedia> Media { get; set; } = new List<PropertyMedia>();
        public ICollection<PropertyDocument> Documents { get; set; } = new List<PropertyDocument>();
        public ICollection<PropertyFloorPlan> FloorPlans { get; set; } = new List<PropertyFloorPlan>();
        public ICollection<PropertyAuditLog> AuditLogs { get; set; } = new List<PropertyAuditLog>();
        public ICollection<Amenity> Amenities { get; set; } = new List<Amenity>();
    }
}
