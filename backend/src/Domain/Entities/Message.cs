using System;
using RealEstate.Domain.Enums;

namespace RealEstate.Domain.Entities
{
    public class Message
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ConversationId { get; set; }
        public Guid SenderId { get; set; }
        public string Content { get; set; } = string.Empty;
        public MessageContentType ContentType { get; set; } = MessageContentType.Text;
        public bool IsRead { get; set; } = false;
        public bool IsDelivered { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Conversation? Conversation { get; set; }
        public User? Sender { get; set; }
    }
}
