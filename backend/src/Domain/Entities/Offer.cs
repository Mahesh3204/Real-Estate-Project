using System;
using RealEstate.Domain.Enums;

namespace RealEstate.Domain.Entities
{
    public class Offer
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PropertyId { get; set; }
        public Guid BuyerId { get; set; }
        public decimal OfferAmount { get; set; }
        public string? Message { get; set; }
        public DateTimeOffset ExpirationDate { get; set; }
        public OfferStatus Status { get; set; } = OfferStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Property? Property { get; set; }
        public User? Buyer { get; set; }
    }
}
