using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Roles.Commands
{
    public class CancelRoleRequestCommand : IRequest<bool>
    {
        public Guid RequestId { get; set; }
    }

    public class CancelRoleRequestCommandHandler : IRequestHandler<CancelRoleRequestCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public CancelRoleRequestCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<bool> Handle(CancelRoleRequestCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("User is not authenticated.");

            var roleRequest = await _context.RoleRequests
                .FirstOrDefaultAsync(r => r.Id == request.RequestId, cancellationToken);

            if (roleRequest == null)
            {
                throw new Exception("Role request not found.");
            }

            if (roleRequest.UserId != userId)
            {
                throw new UnauthorizedAccessException("You are not authorized to cancel this request.");
            }

            if (roleRequest.Status != RoleRequestStatus.Pending)
            {
                throw new Exception("Only pending requests can be cancelled.");
            }

            var oldStatus = roleRequest.Status;
            roleRequest.Status = RoleRequestStatus.Cancelled;
            await _context.SaveChangesAsync(cancellationToken);

            // Log history
            var history = new RealEstate.Domain.Entities.RoleRequestHistory
            {
                RequestId = roleRequest.Id,
                OldStatus = oldStatus,
                NewStatus = RoleRequestStatus.Cancelled,
                ChangedBy = userId,
                Notes = "Request cancelled by user."
            };
            _context.RoleRequestHistories.Add(history);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
