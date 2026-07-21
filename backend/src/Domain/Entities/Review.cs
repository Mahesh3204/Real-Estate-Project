using System;

namespace RealEstate.Domain.Entities
{
    public class Review
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PropertyId { get; set; }
        public Guid BuyerId { get; set; }
        public Guid SellerId { get; set; }
        public int Rating { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
        public string? Images { get; set; } // JSON list of image URLs
        public string? ReplyContent { get; set; }
        public bool IsReported { get; set; } = false;
        public bool IsHidden { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Property? Property { get; set; }
        public User? Buyer { get; set; }
        public User? Seller { get; set; }
    }
}
