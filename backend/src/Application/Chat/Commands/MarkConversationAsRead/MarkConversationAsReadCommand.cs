using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Chat.Commands.MarkConversationAsRead
{
    public class MarkConversationAsReadCommand : IRequest<bool>
    {
        public Guid ConversationId { get; set; }
        public Guid UserId { get; set; }
    }

    public class MarkConversationAsReadCommandValidator : AbstractValidator<MarkConversationAsReadCommand>
    {
        public MarkConversationAsReadCommandValidator()
        {
            RuleFor(x => x.ConversationId).NotEmpty();
            RuleFor(x => x.UserId).NotEmpty();
        }
    }

    public class MarkConversationAsReadCommandHandler : IRequestHandler<MarkConversationAsReadCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public MarkConversationAsReadCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(MarkConversationAsReadCommand request, CancellationToken cancellationToken)
        {
            var unreadMessages = await _context.Messages
                .Where(m => m.ConversationId == request.ConversationId && m.SenderId != request.UserId && !m.IsRead)
                .ToListAsync(cancellationToken);

            if (unreadMessages.Any())
            {
                foreach (var msg in unreadMessages)
                {
                    msg.IsRead = true;
                }
                await _context.SaveChangesAsync(cancellationToken);
            }

            return true;
        }
    }
}
