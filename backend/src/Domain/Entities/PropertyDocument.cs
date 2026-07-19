using System;
using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities
{
    public class PropertyDocument : IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PropertyId { get; set; }
        public Property? Property { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public bool IsPublic { get; set; } = true;
    }
}
