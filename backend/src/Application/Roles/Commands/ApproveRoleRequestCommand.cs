using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Roles.Commands
{
    public class ApproveRoleRequestCommand : IRequest<bool>
    {
        public Guid RequestId { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    public class ApproveRoleRequestCommandHandler : IRequestHandler<ApproveRoleRequestCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly UserManager<User> _userManager;

        public ApproveRoleRequestCommandHandler(
            IApplicationDbContext context,
            ICurrentUserService currentUserService,
            UserManager<User> userManager)
        {
            _context = context;
            _currentUserService = currentUserService;
            _userManager = userManager;
        }

        public async Task<bool> Handle(ApproveRoleRequestCommand request, CancellationToken cancellationToken)
        {
            var adminId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("User is not authenticated.");

            var roleRequest = await _context.RoleRequests
                .Include(r => r.User)
                .Include(r => r.RequestedRole)
                .FirstOrDefaultAsync(r => r.Id == request.RequestId, cancellationToken);

            if (roleRequest == null)
            {
                throw new Exception("Role request not found.");
            }

            if (roleRequest.Status != RoleRequestStatus.Pending)
            {
                throw new Exception("Only pending requests can be approved.");
            }

            var user = roleRequest.User;
            var oldStatus = roleRequest.Status;

            roleRequest.Status = RoleRequestStatus.Approved;
            roleRequest.ReviewedBy = adminId;
            roleRequest.ReviewedAt = DateTime.UtcNow;
            roleRequest.ReviewNotes = request.Notes;

            // Assign the requested role to the user
            var hasRole = await _userManager.IsInRoleAsync(user, roleRequest.RequestedRole.Name!);
            if (!hasRole)
            {
                await _userManager.AddToRoleAsync(user, roleRequest.RequestedRole.Name!);
            }

            // Log history
            var history = new RoleRequestHistory
            {
                RequestId = roleRequest.Id,
                OldStatus = oldStatus,
                NewStatus = RoleRequestStatus.Approved,
                ChangedBy = adminId,
                Notes = request.Notes
            };

            _context.RoleRequestHistories.Add(history);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
