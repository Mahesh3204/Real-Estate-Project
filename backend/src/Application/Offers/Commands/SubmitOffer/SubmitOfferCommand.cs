using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Offers.Commands.SubmitOffer
{
    public class SubmitOfferCommand : IRequest<Guid>
    {
        public Guid PropertyId { get; set; }
        public Guid BuyerId { get; set; }
        public decimal OfferAmount { get; set; }
        public string? Message { get; set; }
        public DateTime ExpirationDate { get; set; }
    }

    public class SubmitOfferCommandValidator : AbstractValidator<SubmitOfferCommand>
    {
        public SubmitOfferCommandValidator()
        {
            RuleFor(x => x.PropertyId).NotEmpty();
            RuleFor(x => x.BuyerId).NotEmpty();
            RuleFor(x => x.OfferAmount).GreaterThan(0).WithMessage("Offer amount must be positive.");
            RuleFor(x => x.ExpirationDate).Must(date => date > DateTime.UtcNow)
                .WithMessage("Expiration date must be in the future.");
        }
    }

    public class SubmitOfferCommandHandler : IRequestHandler<SubmitOfferCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly IChatNotificationService _chatNotificationService;

        public SubmitOfferCommandHandler(IApplicationDbContext context, IChatNotificationService chatNotificationService)
        {
            _context = context;
            _chatNotificationService = chatNotificationService;
        }

        public async Task<Guid> Handle(SubmitOfferCommand request, CancellationToken cancellationToken)
        {
            var property = await _context.Properties.FindAsync(new object[] { request.PropertyId }, cancellationToken);
            if (property == null)
            {
                throw new Exception("Property not found.");
            }

            if (property.OwnerId == request.BuyerId)
            {
                throw new Exception("You cannot submit an offer on your own property.");
            }

            // Check for existing pending offer from this buyer
            var hasPending = await _context.Offers
                .AnyAsync(o => o.BuyerId == request.BuyerId && o.PropertyId == request.PropertyId && o.Status == OfferStatus.Pending, cancellationToken);

            if (hasPending)
            {
                throw new Exception("You already have an active pending offer on this property.");
            }

            var offer = new Offer
            {
                PropertyId = request.PropertyId,
                BuyerId = request.BuyerId,
                OfferAmount = request.OfferAmount,
                Message = request.Message,
                ExpirationDate = request.ExpirationDate,
                Status = OfferStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Offers.Add(offer);

            // Get or create conversation thread for chat integration
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.BuyerId == request.BuyerId && c.PropertyId == request.PropertyId, cancellationToken);

            if (conversation == null)
            {
                conversation = new Conversation
                {
                    PropertyId = request.PropertyId,
                    BuyerId = request.BuyerId,
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

            // Save database changes
            await _context.SaveChangesAsync(cancellationToken);

            // Post structured offer card inside the conversation
            var offerCardData = new
            {
                offerId = offer.Id,
                amount = offer.OfferAmount,
                message = offer.Message ?? string.Empty,
                expiration = offer.ExpirationDate,
                status = "Pending"
            };

            var messageContent = JsonSerializer.Serialize(offerCardData);

            var chatMessage = new Message
            {
                ConversationId = conversation.Id,
                SenderId = request.BuyerId,
                Content = messageContent,
                ContentType = MessageContentType.OfferCard,
                IsRead = false,
                IsDelivered = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.Messages.Add(chatMessage);

            // Create notification for seller
            var notification = new Notification
            {
                RecipientId = property.OwnerId,
                Type = NotificationType.OfferReceived,
                Content = $"New offer of ${offer.OfferAmount:N0} received for property '{property.Title}'.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync(cancellationToken);

            // Broadcast chat message and notifications in real-time
            var buyer = await _context.Users.FindAsync(new object[] { request.BuyerId }, cancellationToken);
            var buyerName = buyer != null ? $"{buyer.FirstName} {buyer.LastName}".Trim() : "Buyer";

            await _chatNotificationService.SendMessageAsync(
                conversation.Id,
                chatMessage.Id,
                request.BuyerId,
                buyerName,
                chatMessage.Content,
                (int)chatMessage.ContentType,
                chatMessage.CreatedAt);

            await _chatNotificationService.SendNotificationAsync(
                property.OwnerId,
                notification.Id,
                notification.Content,
                (int)notification.Type,
                notification.CreatedAt);

            return offer.Id;
        }
    }
}
