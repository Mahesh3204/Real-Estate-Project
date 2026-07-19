using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Admin.Users.Commands
{
    public class UpdateUserRolesCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
        public List<string> Roles { get; set; } = new();
    }

    public class UpdateUserRolesCommandValidator : AbstractValidator<UpdateUserRolesCommand>
    {
        public UpdateUserRolesCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.Roles)
                .NotNull()
                .Must(roles => roles.Count > 0).WithMessage("At least one role must be specified.")
                .Must(roles => roles.All(r => r is "Admin" or "Agent" or "Buyer" or "Seller"))
                .WithMessage("Invalid role specified. Allowed roles are: Admin, Agent, Buyer, Seller.");
        }
    }

    public class UpdateUserRolesCommandHandler : IRequestHandler<UpdateUserRolesCommand, bool>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly ICurrentUserService _currentUserService;

        public UpdateUserRolesCommandHandler(
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            ICurrentUserService currentUserService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _currentUserService = currentUserService;
        }

        public async Task<bool> Handle(UpdateUserRolesCommand request, CancellationToken cancellationToken)
        {
            var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("User is not authenticated.");

            var user = await _userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            var currentRoles = await _userManager.GetRolesAsync(user);

            // Self-demotion guard
            if (request.UserId == currentUserId)
            {
                var isCurrentAdmin = currentRoles.Contains("Admin");
                var willBeAdmin = request.Roles.Contains("Admin");

                if (isCurrentAdmin && !willBeAdmin)
                {
                    throw new RealEstate.Application.Common.Exceptions.ValidationException(new[]
                    {
                        new FluentValidation.Results.ValidationFailure("Roles", "Self-demotion lockout: You cannot remove your own Admin role.")
                    });
                }
            }

            // Verify all requested roles exist in the database
            foreach (var roleName in request.Roles)
            {
                var roleExists = await _roleManager.RoleExistsAsync(roleName);
                if (!roleExists)
                {
                    throw new Exception($"Role '{roleName}' does not exist in the database.");
                }
            }

            // Remove user from roles not in the request
            var rolesToRemove = currentRoles.Except(request.Roles).ToList();
            if (rolesToRemove.Any())
            {
                var removeResult = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
                if (!removeResult.Succeeded)
                {
                    var errors = string.Join(", ", removeResult.Errors.Select(e => e.Description));
                    throw new Exception($"Failed to remove roles: {errors}");
                }
            }

            // Add user to roles in the request but not currently assigned
            var rolesToAdd = request.Roles.Except(currentRoles).ToList();
            if (rolesToAdd.Any())
            {
                var addResult = await _userManager.AddToRolesAsync(user, rolesToAdd);
                if (!addResult.Succeeded)
                {
                    var errors = string.Join(", ", addResult.Errors.Select(e => e.Description));
                    throw new Exception($"Failed to add roles: {errors}");
                }
            }

            // Ensure the user's active role is updated if their active role was removed
            var updatedRoles = await _userManager.GetRolesAsync(user);
            if (user.ActiveRoleId.HasValue)
            {
                var activeRoleObj = await _roleManager.FindByIdAsync(user.ActiveRoleId.Value.ToString());
                if (activeRoleObj == null || !updatedRoles.Contains(activeRoleObj.Name!))
                {
                    // Active role was removed or invalid, reset active role to a remaining role
                    if (updatedRoles.Any())
                    {
                        var newActiveRoleName = updatedRoles.Contains("Buyer") ? "Buyer" : updatedRoles.First();
                        var newActiveRole = await _roleManager.FindByNameAsync(newActiveRoleName);
                        user.ActiveRoleId = newActiveRole?.Id;
                    }
                    else
                    {
                        user.ActiveRoleId = null;
                    }
                    await _userManager.UpdateAsync(user);
                }
            }
            else if (updatedRoles.Any())
            {
                // Assign a default active role if none was set
                var defaultRoleName = updatedRoles.Contains("Buyer") ? "Buyer" : updatedRoles.First();
                var defaultRole = await _roleManager.FindByNameAsync(defaultRoleName);
                user.ActiveRoleId = defaultRole?.Id;
                await _userManager.UpdateAsync(user);
            }

            return true;
        }
    }
}
