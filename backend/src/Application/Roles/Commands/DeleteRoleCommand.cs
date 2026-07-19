using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Roles.Commands
{
    public class DeleteRoleCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }

    public class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand, bool>
    {
        private readonly RoleManager<Role> _roleManager;
        private readonly IApplicationDbContext _context;

        public DeleteRoleCommandHandler(RoleManager<Role> roleManager, IApplicationDbContext context)
        {
            _roleManager = roleManager;
            _context = context;
        }


        public async Task<bool> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
        {
            var role = await _roleManager.FindByIdAsync(request.Id.ToString());
            if (role == null)
            {
                throw new Exception($"Role with ID {request.Id} was not found.");
            }

            // Check if the role is assigned to any users
            var isAssigned = await _context.UserRoles.AnyAsync(ur => ur.RoleId == request.Id, cancellationToken);
            if (isAssigned)
            {
                throw new InvalidOperationException("Cannot delete role because it is assigned to one or more users.");
            }

            var result = await _roleManager.DeleteAsync(role);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Failed to delete role: {errors}");
            }

            return true;
        }
    }
}
