using System;
using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities
{
    public class PropertyMedia : IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PropertyId { get; set; }
        public Property? Property { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string FileType { get; set; } = "Image"; // "Image", "Video"
        public bool IsFeatured { get; set; } = false;
        public int DisplayOrder { get; set; } = 0;
    }
}
