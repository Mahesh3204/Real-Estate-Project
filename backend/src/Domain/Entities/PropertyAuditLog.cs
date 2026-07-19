using System;
using RealEstate.Domain.Common;
using RealEstate.Domain.Enums;

namespace RealEstate.Domain.Entities
{
    public class PropertyAuditLog : IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PropertyId { get; set; }
        public Property? Property { get; set; }
        public Guid UserId { get; set; }
        public User? User { get; set; }
        public PublishStatus OldStatus { get; set; }
        public PublishStatus NewStatus { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
