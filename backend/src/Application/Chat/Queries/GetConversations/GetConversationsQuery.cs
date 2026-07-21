using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Chat.Queries.GetConversations
{
    public class ConversationDto
    {
        public Guid Id { get; set; }
        public Guid PropertyId { get; set; }
        public string PropertyTitle { get; set; } = string.Empty;
        public string PropertyImage { get; set; } = string.Empty;
        public Guid BuyerId { get; set; }
        public Guid SellerId { get; set; }
        public string CounterpartyName { get; set; } = string.Empty;
        public string CounterpartyRole { get; set; } = string.Empty;
        public string? CounterpartyPictureUrl { get; set; }
        public string LastMessageContent { get; set; } = string.Empty;
        public DateTime LastMessageAt { get; set; }
        public int UnreadCount { get; set; }
    }

    public class GetConversationsQuery : IRequest<List<ConversationDto>>
    {
        public Guid UserId { get; set; }
        public string? SearchTerm { get; set; }
    }

    public class GetConversationsQueryHandler : IRequestHandler<GetConversationsQuery, List<ConversationDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetConversationsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ConversationDto>> Handle(GetConversationsQuery request, CancellationToken cancellationToken)
        {
            var userId = request.UserId;

            var conversationsQuery = _context.Conversations
                .Include(c => c.Property)
                .Include(c => c.Buyer)
                .Include(c => c.Seller)
                .Include(c => c.Property!.Media)
                .Where(c => (c.BuyerId == userId && !c.IsDeletedByBuyer) || (c.SellerId == userId && !c.IsDeletedBySeller));

            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                var term = request.SearchTerm.ToLower();
                conversationsQuery = conversationsQuery.Where(c => 
                    c.Property!.Title.ToLower().Contains(term) ||
                    c.Buyer!.FirstName.ToLower().Contains(term) ||
                    c.Buyer!.LastName.ToLower().Contains(term) ||
                    c.Seller!.FirstName.ToLower().Contains(term) ||
                    c.Seller!.LastName.ToLower().Contains(term)
                );
            }

            var conversations = await conversationsQuery
                .OrderByDescending(c => c.LastMessageAt)
                .ToListAsync(cancellationToken);

            var result = new List<ConversationDto>();

            foreach (var c in conversations)
            {
                var isBuyer = c.BuyerId == userId;
                var counterparty = isBuyer ? c.Seller : c.Buyer;
                
                var lastMessage = await _context.Messages
                    .Where(m => m.ConversationId == c.Id)
                    .OrderByDescending(m => m.CreatedAt)
                    .FirstOrDefaultAsync(cancellationToken);

                var unreadCount = await _context.Messages
                    .CountAsync(m => m.ConversationId == c.Id && m.SenderId != userId && !m.IsRead, cancellationToken);

                var firstMedia = c.Property?.Media?.OrderBy(m => m.Id).FirstOrDefault();

                result.Add(new ConversationDto
                {
                    Id = c.Id,
                    PropertyId = c.PropertyId,
                    PropertyTitle = c.Property != null ? c.Property.Title : string.Empty,
                    PropertyImage = firstMedia != null ? firstMedia.FilePath : string.Empty,
                    BuyerId = c.BuyerId,
                    SellerId = c.SellerId,
                    CounterpartyName = counterparty != null ? $"{counterparty.FirstName} {counterparty.LastName}".Trim() : "Deleted User",
                    CounterpartyRole = isBuyer ? "Seller" : "Buyer",
                    CounterpartyPictureUrl = counterparty?.ProfilePictureUrl,
                    LastMessageContent = lastMessage != null ? lastMessage.Content : string.Empty,
                    LastMessageAt = lastMessage != null ? lastMessage.CreatedAt : c.CreatedAt,
                    UnreadCount = unreadCount
                });
            }

            return result.OrderByDescending(r => r.LastMessageAt).ToList();
        }
    }
}
