using System;

namespace RealEstate.Domain.Entities
{
    public class AuditLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? UserId { get; set; }
        public string? UserEmail { get; set; }
        public string Action { get; set; } = string.Empty; // Create, Update, Delete
        public string Resource { get; set; } = string.Empty; // Country, Category, etc.
        public string ResourceId { get; set; } = string.Empty;
        public string? OldValues { get; set; } // JSON serialized modifications
        public string? NewValues { get; set; } // JSON serialized modifications
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}
