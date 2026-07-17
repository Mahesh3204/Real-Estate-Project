using System;

namespace RealEstate.Domain.Entities
{
    public class PropertyInquiry
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BuyerId { get; set; }
        public Guid PropertyId { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Status { get; set; } = "Submitted"; // "Submitted", "Read", "Responded", "Closed", "Archived"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User? Buyer { get; set; }
    }
}
