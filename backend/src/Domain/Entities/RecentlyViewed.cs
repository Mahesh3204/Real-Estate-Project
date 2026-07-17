using System;

namespace RealEstate.Domain.Entities
{
    public class RecentlyViewed
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public Guid PropertyId { get; set; }
        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User? User { get; set; }
    }
}
