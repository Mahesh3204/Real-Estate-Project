using System;
using System.Collections.Generic;
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
    public class RemovePermissionsCommand : IRequest<bool>
    {
        public Guid RoleId { get; set; }
        public List<string> PermissionNames { get; set; } = new();
    }

    public class RemovePermissionsCommandHandler : IRequestHandler<RemovePermissionsCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly RoleManager<Role> _roleManager;

        public RemovePermissionsCommandHandler(IApplicationDbContext context, RoleManager<Role> roleManager)
        {
            _context = context;
            _roleManager = roleManager;
        }

        public async Task<bool> Handle(RemovePermissionsCommand request, CancellationToken cancellationToken)
        {
            var role = await _roleManager.FindByIdAsync(request.RoleId.ToString());
            if (role == null)
            {
                throw new Exception($"Role with ID {request.RoleId} was not found.");
            }

            var permissionsToRemove = await _context.RolePermissions
                .Include(rp => rp.Permission)
                .Where(rp => rp.RoleId == request.RoleId && request.PermissionNames.Contains(rp.Permission.Name))
                .ToListAsync(cancellationToken);

            foreach (var rp in permissionsToRemove)
            {
                _context.RolePermissions.Remove(rp);
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
