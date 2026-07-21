using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Chat.Commands.SendMessage
{
    public class SendMessageCommand : IRequest<Guid>
    {
        public Guid ConversationId { get; set; }
        public Guid SenderId { get; set; }
        public string Content { get; set; } = string.Empty;
        public MessageContentType ContentType { get; set; } = MessageContentType.Text;
    }

    public class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
    {
        public SendMessageCommandValidator()
        {
            RuleFor(x => x.ConversationId).NotEmpty();
            RuleFor(x => x.SenderId).NotEmpty();
            RuleFor(x => x.Content).NotEmpty().MaximumLength(4000);
            RuleFor(x => x.ContentType).IsInEnum();
        }
    }

    public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly IChatNotificationService _chatNotificationService;

        public SendMessageCommandHandler(IApplicationDbContext context, IChatNotificationService chatNotificationService)
        {
            _context = context;
            _chatNotificationService = chatNotificationService;
        }

        public async Task<Guid> Handle(SendMessageCommand request, CancellationToken cancellationToken)
        {
            var conversation = await _context.Conversations.FindAsync(new object[] { request.ConversationId }, cancellationToken);

            if (conversation == null)
            {
                throw new Exception("Conversation not found.");
            }

            if (conversation.BuyerId != request.SenderId && conversation.SellerId != request.SenderId)
            {
                throw new UnauthorizedAccessException("You are not a member of this conversation.");
            }

            var message = new Message
            {
                ConversationId = request.ConversationId,
                SenderId = request.SenderId,
                Content = request.Content,
                ContentType = request.ContentType,
                IsRead = false,
                IsDelivered = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            
            // Update last message timestamp
            conversation.LastMessageAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            var sender = await _context.Users.FindAsync(new object[] { request.SenderId }, cancellationToken);
            var senderName = sender != null ? $"{sender.FirstName} {sender.LastName}".Trim() : string.Empty;

            await _chatNotificationService.SendMessageAsync(
                request.ConversationId,
                message.Id,
                request.SenderId,
                senderName,
                request.Content,
                (int)request.ContentType,
                message.CreatedAt);

            return message.Id;
        }
    }
}
