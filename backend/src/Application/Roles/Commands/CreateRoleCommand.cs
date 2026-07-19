using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using RealEstate.Domain.Entities;


namespace RealEstate.Application.Roles.Commands
{
    public class CreateRoleCommand : IRequest<Guid>
    {
        public string Name { get; set; } = string.Empty;
    }

    public class CreateRoleCommandValidator : AbstractValidator<CreateRoleCommand>
    {
        private readonly RoleManager<Role> _roleManager;

        public CreateRoleCommandValidator(RoleManager<Role> roleManager)
        {
            _roleManager = roleManager;

            RuleFor(v => v.Name)
                .NotEmpty().WithMessage("Role name is required.")
                .MaximumLength(256).WithMessage("Role name must not exceed 256 characters.")
                .MustAsync(async (name, cancellation) =>
                {
                    var exists = await _roleManager.RoleExistsAsync(name);
                    return !exists;
                }).WithMessage("Role name must be unique.");
        }
    }

    public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, Guid>
    {
        private readonly RoleManager<Role> _roleManager;

        public CreateRoleCommandHandler(RoleManager<Role> roleManager)
        {
            _roleManager = roleManager;
        }

        public async Task<Guid> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
        {
            var role = new Role(request.Name);
            var result = await _roleManager.CreateAsync(role);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Failed to create role: {errors}");
            }

            return role.Id;
        }
    }
}
