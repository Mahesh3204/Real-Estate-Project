using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using RealEstate.API.Hubs;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.API.Services
{
    public class ChatNotificationService : IChatNotificationService
    {
        private readonly IHubContext<ChatHub> _chatHubContext;
        private readonly IHubContext<NotificationHub> _notificationHubContext;

        public ChatNotificationService(
            IHubContext<ChatHub> chatHubContext,
            IHubContext<NotificationHub> notificationHubContext)
        {
            _chatHubContext = chatHubContext;
            _notificationHubContext = notificationHubContext;
        }

        public async Task SendMessageAsync(Guid conversationId, Guid messageId, Guid senderId, string senderName, string content, int contentType, DateTime createdAt)
        {
            await _chatHubContext.Clients.Group(conversationId.ToString()).SendAsync("ReceiveMessage", new
            {
                Id = messageId,
                ConversationId = conversationId,
                SenderId = senderId,
                SenderName = senderName,
                Content = content,
                ContentType = contentType,
                IsRead = false,
                IsDelivered = true,
                CreatedAt = createdAt
            });
        }

        public async Task SendNotificationAsync(Guid recipientId, Guid notificationId, string content, int type, DateTime createdAt)
        {
            // Send to user group based on user identifier (SignalR handles routing by user ID automatically via User method)
            await _notificationHubContext.Clients.User(recipientId.ToString()).SendAsync("ReceiveNotification", new
            {
                Id = notificationId,
                RecipientId = recipientId,
                Type = type,
                Content = content,
                IsRead = false,
                CreatedAt = createdAt
            });
        }
    }
}
