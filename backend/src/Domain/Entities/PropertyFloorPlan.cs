using System;
using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities
{
    public class PropertyFloorPlan : IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PropertyId { get; set; }
        public Property? Property { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty; // e.g. "Ground Floor"
        public string? Dimensions { get; set; } // e.g. "40 x 50 ft"
    }
}
