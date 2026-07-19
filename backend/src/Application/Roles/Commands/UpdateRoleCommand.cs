using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Roles.Commands
{
    public class UpdateRoleCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateRoleCommandValidator : AbstractValidator<UpdateRoleCommand>
    {
        private readonly RoleManager<Role> _roleManager;

        public UpdateRoleCommandValidator(RoleManager<Role> roleManager)
        {
            _roleManager = roleManager;

            RuleFor(v => v.Name)
                .NotEmpty().WithMessage("Role name is required.")
                .MaximumLength(256).WithMessage("Role name must not exceed 256 characters.")
                .MustAsync(async (command, name, cancellation) =>
                {
                    var existingRole = await _roleManager.Roles
                        .FirstOrDefaultAsync(r => r.Name == name, cancellation);

                    return existingRole == null || existingRole.Id == command.Id;
                }).WithMessage("Role name must be unique.");
        }
    }

    public class UpdateRoleCommandHandler : IRequestHandler<UpdateRoleCommand, bool>
    {
        private readonly RoleManager<Role> _roleManager;

        public UpdateRoleCommandHandler(RoleManager<Role> roleManager)
        {
            _roleManager = roleManager;
        }

        public async Task<bool> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
        {
            var role = await _roleManager.FindByIdAsync(request.Id.ToString());
            if (role == null)
            {
                throw new Exception($"Role with ID {request.Id} was not found.");
            }

            role.Name = request.Name;
            role.NormalizedName = request.Name.ToUpperInvariant();

            var result = await _roleManager.UpdateAsync(role);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Failed to update role: {errors}");
            }

            return true;
        }
    }
}
