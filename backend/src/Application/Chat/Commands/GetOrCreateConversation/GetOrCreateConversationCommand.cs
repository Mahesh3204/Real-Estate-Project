using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Chat.Commands.GetOrCreateConversation
{
    public class GetOrCreateConversationCommand : IRequest<Guid>
    {
        public Guid PropertyId { get; set; }
        public Guid BuyerId { get; set; }
    }

    public class GetOrCreateConversationCommandValidator : AbstractValidator<GetOrCreateConversationCommand>
    {
        public GetOrCreateConversationCommandValidator()
        {
            RuleFor(x => x.PropertyId).NotEmpty();
            RuleFor(x => x.BuyerId).NotEmpty();
        }
    }

    public class GetOrCreateConversationCommandHandler : IRequestHandler<GetOrCreateConversationCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public GetOrCreateConversationCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(GetOrCreateConversationCommand request, CancellationToken cancellationToken)
        {
            var property = await _context.Properties.FindAsync(new object[] { request.PropertyId }, cancellationToken);

            if (property == null)
            {
                throw new Exception("Property not found.");
            }

            if (property.OwnerId == request.BuyerId)
            {
                throw new Exception("Cannot start conversation with yourself on your own property.");
            }

            // Check if conversation already exists
            var existing = await _context.Conversations
                .FirstOrDefaultAsync(c => c.BuyerId == request.BuyerId && c.PropertyId == request.PropertyId, cancellationToken);

            if (existing != null)
            {
                // Undelete if soft deleted
                if (existing.IsDeletedByBuyer || existing.IsDeletedBySeller)
                {
                    existing.IsDeletedByBuyer = false;
                    existing.IsDeletedBySeller = false;
                    await _context.SaveChangesAsync(cancellationToken);
                }
                return existing.Id;
            }

            var conversation = new Conversation
            {
                PropertyId = request.PropertyId,
                BuyerId = request.BuyerId,
                SellerId = property.OwnerId,
                CreatedAt = DateTime.UtcNow,
                LastMessageAt = DateTime.UtcNow,
                IsDeletedByBuyer = false,
                IsDeletedBySeller = false
            };

            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync(cancellationToken);

            return conversation.Id;
        }
    }
}
