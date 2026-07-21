using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Chat.Queries.GetMessages
{
    public class MessageDto
    {
        public Guid Id { get; set; }
        public Guid ConversationId { get; set; }
        public Guid SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int ContentType { get; set; }
        public bool IsRead { get; set; }
        public bool IsDelivered { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class GetMessagesQuery : IRequest<List<MessageDto>>
    {
        public Guid ConversationId { get; set; }
        public Guid UserId { get; set; }
    }

    public class GetMessagesQueryHandler : IRequestHandler<GetMessagesQuery, List<MessageDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetMessagesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<MessageDto>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
        {
            // Verify access
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.Id == request.ConversationId, cancellationToken);

            if (conversation == null || (conversation.BuyerId != request.UserId && conversation.SellerId != request.UserId))
            {
                throw new UnauthorizedAccessException("You do not have access to this conversation.");
            }

            var messages = await _context.Messages
                .Include(m => m.Sender)
                .Where(m => m.ConversationId == request.ConversationId)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new MessageDto
                {
                    Id = m.Id,
                    ConversationId = m.ConversationId,
                    SenderId = m.SenderId,
                    SenderName = m.Sender != null ? $"{m.Sender.FirstName} {m.Sender.LastName}".Trim() : string.Empty,
                    Content = m.Content,
                    ContentType = (int)m.ContentType,
                    IsRead = m.IsRead,
                    IsDelivered = m.IsDelivered,
                    CreatedAt = m.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return messages;
        }
    }
}
