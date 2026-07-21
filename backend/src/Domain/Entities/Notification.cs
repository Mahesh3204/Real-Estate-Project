using System;
using RealEstate.Domain.Enums;

namespace RealEstate.Domain.Entities
{
    public class Notification
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid RecipientId { get; set; }
        public NotificationType Type { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User? Recipient { get; set; }
    }
}
