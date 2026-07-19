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
    public class AssignPermissionsCommand : IRequest<bool>
    {
        public Guid RoleId { get; set; }
        public List<string> PermissionNames { get; set; } = new();
    }

    public class AssignPermissionsCommandHandler : IRequestHandler<AssignPermissionsCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly RoleManager<Role> _roleManager;

        public AssignPermissionsCommandHandler(IApplicationDbContext context, RoleManager<Role> roleManager)
        {
            _context = context;
            _roleManager = roleManager;
        }

        public async Task<bool> Handle(AssignPermissionsCommand request, CancellationToken cancellationToken)
        {
            var role = await _roleManager.FindByIdAsync(request.RoleId.ToString());
            if (role == null)
            {
                throw new Exception($"Role with ID {request.RoleId} was not found.");
            }

            // Retrieve the requested permissions from database
            var permissions = await _context.Permissions
                .Where(p => request.PermissionNames.Contains(p.Name))
                .ToListAsync(cancellationToken);

            // Find already assigned permissions
            var existingPermissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == request.RoleId)
                .Select(rp => rp.PermissionId)
                .ToListAsync(cancellationToken);

            foreach (var permission in permissions)
            {
                if (!existingPermissions.Contains(permission.Id))
                {
                    _context.RolePermissions.Add(new RolePermission
                    {
                        RoleId = request.RoleId,
                        PermissionId = permission.Id
                    });
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
