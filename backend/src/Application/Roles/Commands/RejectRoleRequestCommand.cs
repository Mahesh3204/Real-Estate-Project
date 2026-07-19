using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Roles.Commands
{
    public class RejectRoleRequestCommand : IRequest<bool>
    {
        public Guid RequestId { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    public class RejectRoleRequestCommandHandler : IRequestHandler<RejectRoleRequestCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public RejectRoleRequestCommandHandler(
            IApplicationDbContext context,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<bool> Handle(RejectRoleRequestCommand request, CancellationToken cancellationToken)
        {
            var adminId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("User is not authenticated.");

            var roleRequest = await _context.RoleRequests
                .FirstOrDefaultAsync(r => r.Id == request.RequestId, cancellationToken);

            if (roleRequest == null)
            {
                throw new Exception("Role request not found.");
            }

            if (roleRequest.Status != RoleRequestStatus.Pending)
            {
                throw new Exception("Only pending requests can be rejected.");
            }

            var oldStatus = roleRequest.Status;

            roleRequest.Status = RoleRequestStatus.Rejected;
            roleRequest.ReviewedBy = adminId;
            roleRequest.ReviewedAt = DateTime.UtcNow;
            roleRequest.ReviewNotes = request.Notes;

            // Log history
            var history = new RoleRequestHistory
            {
                RequestId = roleRequest.Id,
                OldStatus = oldStatus,
                NewStatus = RoleRequestStatus.Rejected,
                ChangedBy = adminId,
                Notes = request.Notes
            };

            _context.RoleRequestHistories.Add(history);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
