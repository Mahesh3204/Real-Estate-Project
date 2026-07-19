using System;
using System.Collections.Generic;
using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities
{
    public class PropertyCategory : IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty; // Unique
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        public ICollection<PropertyType> PropertyTypes { get; set; } = new List<PropertyType>();
    }

    public class PropertyType : IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CategoryId { get; set; }
        public PropertyCategory Category { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty; // Unique
        public string? Description { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
    }

    public class PropertyStatus : IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty; // Unique
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;
    }

    public class PropertyCondition : IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty; // Unique
    }

    public class Amenity : IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty; // Unique
        public string? IconUrl { get; set; }
        public string Category { get; set; } = string.Empty; // e.g., Indoor, Outdoor
        public string? Description { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;
    }
}
