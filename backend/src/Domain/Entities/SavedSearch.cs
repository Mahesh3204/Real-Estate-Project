using System;
using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities
{
    public class SavedSearch : IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string QueryParameters { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation
        public User? User { get; set; }
    }
}
