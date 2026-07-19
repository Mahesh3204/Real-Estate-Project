using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Roles.Queries;

namespace RealEstate.Application.AuditLogs.Queries
{
    public class AuditLogDto
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public string? UserEmail { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
        public string ResourceId { get; set; } = string.Empty;
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public DateTime Timestamp { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }

    public class GetAuditLogsQuery : IRequest<PaginatedList<AuditLogDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }
    }

    public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, PaginatedList<AuditLogDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAuditLogsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedList<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.AuditLogs.AsNoTracking();

            // Search filter (UserEmail, Action, Resource)
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                string search = request.SearchTerm.ToLowerInvariant();
                query = query.Where(l =>
                    (l.UserEmail != null && l.UserEmail.ToLower().Contains(search)) ||
                    l.Action.ToLower().Contains(search) ||
                    l.Resource.ToLower().Contains(search)
                );
            }

            // Always order by Timestamp descending (most recent logs first)
            query = query.OrderByDescending(l => l.Timestamp);

            int count = await query.CountAsync(cancellationToken);

            var logs = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(l => new AuditLogDto
                {
                    Id = l.Id,
                    UserId = l.UserId,
                    UserEmail = l.UserEmail,
                    Action = l.Action,
                    Resource = l.Resource,
                    ResourceId = l.ResourceId,
                    OldValues = l.OldValues,
                    NewValues = l.NewValues,
                    Timestamp = l.Timestamp,
                    IpAddress = l.IpAddress,
                    UserAgent = l.UserAgent
                })
                .ToListAsync(cancellationToken);

            return new PaginatedList<AuditLogDto>(logs, count, request.PageNumber, request.PageSize);
        }
    }
}
