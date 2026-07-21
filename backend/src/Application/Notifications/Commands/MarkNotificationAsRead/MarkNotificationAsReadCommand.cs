using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Notifications.Commands.MarkNotificationAsRead
{
    public class MarkNotificationAsReadCommand : IRequest<bool>
    {
        public Guid NotificationId { get; set; }
        public Guid UserId { get; set; }
        public bool MarkAll { get; set; }
    }

    public class MarkNotificationAsReadCommandValidator : AbstractValidator<MarkNotificationAsReadCommand>
    {
        public MarkNotificationAsReadCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
        }
    }

    public class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public MarkNotificationAsReadCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
        {
            if (request.MarkAll)
            {
                var unread = await _context.Notifications
                    .Where(n => n.RecipientId == request.UserId && !n.IsRead)
                    .ToListAsync(cancellationToken);

                foreach (var n in unread)
                {
                    n.IsRead = true;
                }
            }
            else
            {
                var notification = await _context.Notifications.FindAsync(new object[] { request.NotificationId }, cancellationToken);
                if (notification != null)
                {
                    if (notification.RecipientId != request.UserId)
                    {
                        throw new UnauthorizedAccessException("Not authorized to mark this notification as read.");
                    }
                    notification.IsRead = true;
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
