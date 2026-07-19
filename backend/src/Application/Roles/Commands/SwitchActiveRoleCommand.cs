using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Roles.Commands
{
    public class SwitchActiveRoleCommand : IRequest<string>
    {
        public string RoleName { get; set; } = string.Empty;
    }

    public class SwitchActiveRoleCommandHandler : IRequestHandler<SwitchActiveRoleCommand, string>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;

        public SwitchActiveRoleCommandHandler(
            ICurrentUserService currentUserService,
            UserManager<User> userManager,
            RoleManager<Role> roleManager)
        {
            _currentUserService = currentUserService;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<string> Handle(SwitchActiveRoleCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("User is not authenticated.");

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            // 1. Verify user is actually in this role
            var hasRole = await _userManager.IsInRoleAsync(user, request.RoleName);
            if (!hasRole)
            {
                throw new RealEstate.Application.Common.Exceptions.ValidationException(new[]
                {
                    new FluentValidation.Results.ValidationFailure("RoleName", $"You do not possess the role '{request.RoleName}'.")
                });
            }

            // 2. Find the role's Guid
            var role = await _roleManager.FindByNameAsync(request.RoleName);
            if (role == null)
            {
                throw new Exception($"Role '{request.RoleName}' does not exist in the system.");
            }

            // 3. Update the ActiveRoleId
            user.ActiveRoleId = role.Id;
            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", System.Linq.Enumerable.Select(result.Errors, e => e.Description));
                throw new Exception($"Failed to switch active role: {errors}");
            }

            return request.RoleName;
        }
    }
}
