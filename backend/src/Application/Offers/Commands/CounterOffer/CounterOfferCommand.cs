using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Offers.Commands.CounterOffer
{
    public class CounterOfferCommand : IRequest<Guid>
    {
        public Guid OriginalOfferId { get; set; }
        public Guid SenderId { get; set; }
        public decimal CounterAmount { get; set; }
        public string? Message { get; set; }
        public DateTime ExpirationDate { get; set; }
    }

    public class CounterOfferCommandValidator : AbstractValidator<CounterOfferCommand>
    {
        public CounterOfferCommandValidator()
        {
            RuleFor(x => x.OriginalOfferId).NotEmpty();
            RuleFor(x => x.SenderId).NotEmpty();
            RuleFor(x => x.CounterAmount).GreaterThan(0).WithMessage("Counter amount must be positive.");
            RuleFor(x => x.ExpirationDate).Must(date => date > DateTime.UtcNow)
                .WithMessage("Expiration date must be in the future.");
        }
    }

    public class CounterOfferCommandHandler : IRequestHandler<CounterOfferCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly IChatNotificationService _chatNotificationService;

        public CounterOfferCommandHandler(IApplicationDbContext context, IChatNotificationService chatNotificationService)
        {
            _context = context;
            _chatNotificationService = chatNotificationService;
        }

        public async Task<Guid> Handle(CounterOfferCommand request, CancellationToken cancellationToken)
        {
            var originalOffer = await _context.Offers
                .Include(o => o.Property)
                .FirstOrDefaultAsync(o => o.Id == request.OriginalOfferId, cancellationToken);

            if (originalOffer == null)
            {
                throw new Exception("Original offer not found.");
            }

            if (originalOffer.Status != OfferStatus.Pending)
            {
                throw new Exception("Can only counter a pending offer.");
            }

            var property = originalOffer.Property;
            if (property == null)
            {
                throw new Exception("Property not found.");
            }

            // Verify sender is authorized (must be either the buyer or the seller)
            if (request.SenderId != originalOffer.BuyerId && request.SenderId != property.OwnerId)
            {
                throw new UnauthorizedAccessException("You are not authorized to counter this offer.");
            }

            // Update original offer status
            originalOffer.Status = OfferStatus.Countered;

            // Create new counter offer
            var counterOffer = new Offer
            {
                PropertyId = originalOffer.PropertyId,
                BuyerId = originalOffer.BuyerId,
                OfferAmount = request.CounterAmount,
                Message = request.Message,
                ExpirationDate = request.ExpirationDate,
                Status = OfferStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Offers.Add(counterOffer);

            // Get the conversation
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.BuyerId == originalOffer.BuyerId && c.PropertyId == originalOffer.PropertyId, cancellationToken);

            if (conversation == null)
            {
                conversation = new Conversation
                {
                    PropertyId = originalOffer.PropertyId,
                    BuyerId = originalOffer.BuyerId,
                    SellerId = property.OwnerId,
                    CreatedAt = DateTime.UtcNow,
                    LastMessageAt = DateTime.UtcNow
                };
                _context.Conversations.Add(conversation);
            }
            else
            {
                conversation.LastMessageAt = DateTime.UtcNow;
                conversation.IsDeletedByBuyer = false;
                conversation.IsDeletedBySeller = false;
            }

            await _context.SaveChangesAsync(cancellationToken);

            // Create offer card message
            var isSellerCounter = request.SenderId == property.OwnerId;
            var counterpartyId = isSellerCounter ? originalOffer.BuyerId : property.OwnerId;

            var offerCardData = new
            {
                offerId = counterOffer.Id,
                amount = counterOffer.OfferAmount,
                message = counterOffer.Message ?? string.Empty,
                expiration = counterOffer.ExpirationDate,
                status = "Pending",
                isCounter = true,
                counteredBySeller = isSellerCounter
            };

            var messageContent = JsonSerializer.Serialize(offerCardData);

            var chatMessage = new Message
            {
                ConversationId = conversation.Id,
                SenderId = request.SenderId,
                Content = messageContent,
                ContentType = MessageContentType.OfferCard,
                IsRead = false,
                IsDelivered = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.Messages.Add(chatMessage);

            // Create notification for recipient
            var notification = new Notification
            {
                RecipientId = counterpartyId,
                Type = NotificationType.OfferReceived,
                Content = $"Counter offer of ${counterOffer.OfferAmount:N0} received for property '{property.Title}'.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync(cancellationToken);

            // Broadcast real-time notifications
            var sender = await _context.Users.FindAsync(new object[] { request.SenderId }, cancellationToken);
            var senderName = sender != null ? $"{sender.FirstName} {sender.LastName}".Trim() : "Counter-party";

            await _chatNotificationService.SendMessageAsync(
                conversation.Id,
                chatMessage.Id,
                request.SenderId,
                senderName,
                chatMessage.Content,
                (int)chatMessage.ContentType,
                chatMessage.CreatedAt);

            await _chatNotificationService.SendNotificationAsync(
                counterpartyId,
                notification.Id,
                notification.Content,
                (int)notification.Type,
                notification.CreatedAt);

            return counterOffer.Id;
        }
    }
}
