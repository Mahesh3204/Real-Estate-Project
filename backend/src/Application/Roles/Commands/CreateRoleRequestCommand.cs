using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Roles.Commands
{
    public class CreateRoleRequestCommand : IRequest<Guid>
    {
        public string RequestedRoleName { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }

    public class CreateRoleRequestCommandValidator : AbstractValidator<CreateRoleRequestCommand>
    {
        public CreateRoleRequestCommandValidator()
        {
            RuleFor(x => x.RequestedRoleName)
                .NotEmpty().WithMessage("Requested role name is required.")
                .Must(role => role is "Seller" or "Agent")
                .WithMessage("Only Seller or Agent upgrades can be requested.");

            RuleFor(x => x.Reason)
                .NotEmpty().WithMessage("A reason is required.")
                .MaximumLength(500).WithMessage("Reason must not exceed 500 characters.");
        }
    }

    public class CreateRoleRequestCommandHandler : IRequestHandler<CreateRoleRequestCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;

        public CreateRoleRequestCommandHandler(
            IApplicationDbContext context,
            ICurrentUserService currentUserService,
            UserManager<User> userManager,
            RoleManager<Role> roleManager)
        {
            _context = context;
            _currentUserService = currentUserService;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<Guid> Handle(CreateRoleRequestCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("User is not authenticated.");

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            var requestedRole = await _roleManager.FindByNameAsync(request.RequestedRoleName);
            if (requestedRole == null)
            {
                throw new Exception($"Role '{request.RequestedRoleName}' does not exist in the system.");
            }

            // 1. Check if user already has this role
            var hasRole = await _userManager.IsInRoleAsync(user, request.RequestedRoleName);
            if (hasRole)
            {
                throw new RealEstate.Application.Common.Exceptions.ValidationException(new[]
                {
                    new FluentValidation.Results.ValidationFailure("RequestedRoleName", "You already possess this role.")
                });
            }

            // 2. Check for duplicate pending requests
            var hasPending = await _context.RoleRequests
                .AnyAsync(r => r.UserId == userId && r.RequestedRoleId == requestedRole.Id && r.Status == RoleRequestStatus.Pending, cancellationToken);
            if (hasPending)
            {
                throw new RealEstate.Application.Common.Exceptions.ValidationException(new[]
                {
                    new FluentValidation.Results.ValidationFailure("RequestedRoleName", "You already have a pending upgrade request for this role.")
                });
            }

            // Check configuration for Auto-Approval
            var autoApproveSetting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == "AutoApproveRoleRequests", cancellationToken);
            bool isAutoApprove = autoApproveSetting != null && bool.TryParse(autoApproveSetting.Value, out var val) && val;

            var roleRequest = new RoleRequest
            {
                UserId = userId,
                RequestedRoleId = requestedRole.Id,
                Reason = request.Reason,
                Status = isAutoApprove ? RoleRequestStatus.Approved : RoleRequestStatus.Pending,
                SubmittedAt = DateTime.UtcNow
            };

            if (isAutoApprove)
            {
                roleRequest.ReviewedAt = DateTime.UtcNow;
                roleRequest.ReviewNotes = "System auto-approved.";
            }

            _context.RoleRequests.Add(roleRequest);
            await _context.SaveChangesAsync(cancellationToken);

            // Log history
            var history = new RoleRequestHistory
            {
                RequestId = roleRequest.Id,
                OldStatus = RoleRequestStatus.Pending,
                NewStatus = roleRequest.Status,
                ChangedBy = userId,
                Notes = isAutoApprove ? "System auto-approved." : "Request submitted for approval."
            };
            _context.RoleRequestHistories.Add(history);
            await _context.SaveChangesAsync(cancellationToken);

            if (isAutoApprove)
            {
                // Assign the role immediately
                await _userManager.AddToRoleAsync(user, request.RequestedRoleName);
            }

            return roleRequest.Id;
        }
    }
}
