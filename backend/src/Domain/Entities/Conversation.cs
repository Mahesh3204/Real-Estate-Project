using System;
using System.Collections.Generic;

namespace RealEstate.Domain.Entities
{
    public class Conversation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PropertyId { get; set; }
        public Guid BuyerId { get; set; }
        public Guid SellerId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;
        public bool IsDeletedByBuyer { get; set; } = false;
        public bool IsDeletedBySeller { get; set; } = false;

        // Navigation
        public Property? Property { get; set; }
        public User? Buyer { get; set; }
        public User? Seller { get; set; }
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}
