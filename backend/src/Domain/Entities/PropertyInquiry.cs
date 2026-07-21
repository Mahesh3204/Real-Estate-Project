using System;
using RealEstate.Domain.Enums;

namespace RealEstate.Domain.Entities
{
    public class PropertyInquiry
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BuyerId { get; set; }
        public Guid PropertyId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public PreferredContactMethod PreferredContactMethod { get; set; } = PreferredContactMethod.Email;
        public string PreferredContactTime { get; set; } = string.Empty;
        public InquiryStatus Status { get; set; } = InquiryStatus.New;
        public string? ReplyMessage { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;

        // Navigation
        public User? Buyer { get; set; }
        public Property? Property { get; set; }
    }
}
