using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Notifications.Queries.GetNotifications
{
    public class NotificationDto
    {
        public Guid Id { get; set; }
        public Guid RecipientId { get; set; }
        public int Type { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class GetNotificationsQuery : IRequest<List<NotificationDto>>
    {
        public Guid UserId { get; set; }
    }

    public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, List<NotificationDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetNotificationsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
        {
            var notifications = await _context.Notifications
                .Where(n => n.RecipientId == request.UserId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    RecipientId = n.RecipientId,
                    Type = (int)n.Type,
                    Content = n.Content,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return notifications;
        }
    }
}
