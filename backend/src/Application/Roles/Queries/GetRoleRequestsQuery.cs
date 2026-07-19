using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Roles.Queries
{
    public class RoleRequestDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string RequestedRole { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
        public Guid? ReviewedBy { get; set; }
        public string? ReviewerName { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewNotes { get; set; }
    }

    public class PaginatedListDto<T>
    {
        public System.Collections.Generic.List<T> Items { get; set; } = new();
        public int PageNumber { get; set; }
        public int TotalPages { get; set; }
        public int TotalRecords { get; set; }
        public int PageSize { get; set; }
    }

    public class GetRoleRequestsQuery : IRequest<PaginatedListDto<RoleRequestDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public RoleRequestStatus? Status { get; set; }
        public string? SearchQuery { get; set; }
    }

    public class GetRoleRequestsQueryHandler : IRequestHandler<GetRoleRequestsQuery, PaginatedListDto<RoleRequestDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly UserManager<RealEstate.Domain.Entities.User> _userManager;

        public GetRoleRequestsQueryHandler(
            IApplicationDbContext context,
            ICurrentUserService currentUserService,
            UserManager<RealEstate.Domain.Entities.User> userManager)
        {
            _context = context;
            _currentUserService = currentUserService;
            _userManager = userManager;
        }

        public async Task<PaginatedListDto<RoleRequestDto>> Handle(GetRoleRequestsQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("User is not authenticated.");
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            var query = _context.RoleRequests
                .Include(r => r.User)
                .Include(r => r.RequestedRole)
                .Include(r => r.Reviewer)
                .AsNoTracking();

            // Enforce security: non-admins can only see their own requests!
            var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (!isAdmin)
            {
                query = query.Where(r => r.UserId == userId);
            }

            if (request.Status.HasValue)
            {
                query = query.Where(r => r.Status == request.Status.Value);
            }

            if (!string.IsNullOrEmpty(request.SearchQuery))
            {
                var search = request.SearchQuery.ToLower();
                query = query.Where(r => r.Reason.ToLower().Contains(search) ||
                                         r.User.FirstName.ToLower().Contains(search) ||
                                         r.User.LastName.ToLower().Contains(search));
            }

            query = query.OrderByDescending(r => r.SubmittedAt);

            var totalRecords = await query.CountAsync(cancellationToken);
            var items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(r => new RoleRequestDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserName = $"{r.User.FirstName} {r.User.LastName}",
                    RequestedRole = r.RequestedRole.Name ?? string.Empty,
                    Status = r.Status.ToString(),
                    Reason = r.Reason,
                    SubmittedAt = r.SubmittedAt,
                    ReviewedBy = r.ReviewedBy,
                    ReviewerName = r.Reviewer != null ? $"{r.Reviewer.FirstName} {r.Reviewer.LastName}" : null,
                    ReviewedAt = r.ReviewedAt,
                    ReviewNotes = r.ReviewNotes
                })
                .ToListAsync(cancellationToken);

            var totalPages = (int)Math.Ceiling(totalRecords / (double)request.PageSize);

            return new PaginatedListDto<RoleRequestDto>
            {
                Items = items,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalRecords = totalRecords,
                TotalPages = totalPages
            };
        }
    }
}
