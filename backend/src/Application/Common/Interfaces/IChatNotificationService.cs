using System;
using System.Threading.Tasks;

namespace RealEstate.Application.Common.Interfaces
{
    public interface IChatNotificationService
    {
        Task SendMessageAsync(Guid conversationId, Guid messageId, Guid senderId, string senderName, string content, int contentType, DateTime createdAt);
        Task SendNotificationAsync(Guid recipientId, Guid notificationId, string content, int type, DateTime createdAt);
    }
}
