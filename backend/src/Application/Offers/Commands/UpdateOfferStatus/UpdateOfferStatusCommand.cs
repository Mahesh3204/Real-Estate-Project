using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Offers.Commands.UpdateOfferStatus
{
    public class UpdateOfferStatusCommand : IRequest<bool>
    {
        public Guid OfferId { get; set; }
        public Guid UserId { get; set; }
        public OfferStatus Status { get; set; }
    }

    public class UpdateOfferStatusCommandValidator : AbstractValidator<UpdateOfferStatusCommand>
    {
        public UpdateOfferStatusCommandValidator()
        {
            RuleFor(x => x.OfferId).NotEmpty();
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.Status).IsInEnum();
        }
    }

    public class UpdateOfferStatusCommandHandler : IRequestHandler<UpdateOfferStatusCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly IChatNotificationService _chatNotificationService;

        public UpdateOfferStatusCommandHandler(IApplicationDbContext context, IChatNotificationService chatNotificationService)
        {
            _context = context;
            _chatNotificationService = chatNotificationService;
        }

        public async Task<bool> Handle(UpdateOfferStatusCommand request, CancellationToken cancellationToken)
        {
            var offer = await _context.Offers
                .Include(o => o.Property)
                .FirstOrDefaultAsync(o => o.Id == request.OfferId, cancellationToken);

            if (offer == null)
            {
                throw new Exception("Offer not found.");
            }

            if (offer.Status != OfferStatus.Pending)
            {
                throw new Exception("Can only change status of a pending offer.");
            }

            var property = offer.Property;
            if (property == null)
            {
                throw new Exception("Property not found.");
            }

            // Authorization check
            if (request.Status == OfferStatus.Accepted || request.Status == OfferStatus.Rejected)
            {
                if (request.UserId != property.OwnerId)
                {
                    throw new UnauthorizedAccessException("Only the property owner can accept or reject an offer.");
                }
            }
            else if (request.Status == OfferStatus.Cancelled)
            {
                if (request.UserId != offer.BuyerId)
                {
                    throw new UnauthorizedAccessException("Only the offer issuer can cancel the offer.");
                }
            }
            else
            {
                throw new Exception("Invalid target status.");
            }

            offer.Status = request.Status;

            // Get chat thread to post update notice
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.BuyerId == offer.BuyerId && c.PropertyId == offer.PropertyId, cancellationToken);

            if (conversation != null)
            {
                var roleName = request.UserId == property.OwnerId ? "Seller" : "Buyer";
                var textContent = $"Offer of ${offer.OfferAmount:N0} has been {request.Status.ToString().ToLower()} by the {roleName.ToLower()}.";

                var chatMessage = new Message
                {
                    ConversationId = conversation.Id,
                    SenderId = request.UserId,
                    Content = textContent,
                    ContentType = MessageContentType.Text,
                    IsRead = false,
                    IsDelivered = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Messages.Add(chatMessage);
                conversation.LastMessageAt = DateTime.UtcNow;

                var sender = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);
                var senderName = sender != null ? $"{sender.FirstName} {sender.LastName}".Trim() : roleName;

                await _chatNotificationService.SendMessageAsync(
                    conversation.Id,
                    chatMessage.Id,
                    request.UserId,
                    senderName,
                    chatMessage.Content,
                    (int)chatMessage.ContentType,
                    chatMessage.CreatedAt);
            }

            // Create notification for counterparty
            var recipientId = request.UserId == property.OwnerId ? offer.BuyerId : property.OwnerId;
            var notification = new Notification
            {
                RecipientId = recipientId,
                Type = NotificationType.OfferReceived, // We can reuse or send standard
                Content = $"Offer of ${offer.OfferAmount:N0} for property '{property.Title}' was {request.Status.ToString().ToLower()}.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync(cancellationToken);

            await _chatNotificationService.SendNotificationAsync(
                recipientId,
                notification.Id,
                notification.Content,
                (int)notification.Type,
                notification.CreatedAt);

            return true;
        }
    }
}
