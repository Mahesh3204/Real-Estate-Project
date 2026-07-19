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

namespace RealEstate.Application.Roles.Queries
{
    public class PermissionDetailsDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class RoleDetailsDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<PermissionDetailsDto> Permissions { get; set; } = new();
    }

    public class GetRoleByIdQuery : IRequest<RoleDetailsDto>
    {
        public Guid Id { get; set; }
    }

    public class GetRoleByIdQueryHandler : IRequestHandler<GetRoleByIdQuery, RoleDetailsDto>
    {
        private readonly RoleManager<Role> _roleManager;
        private readonly IApplicationDbContext _context;

        public GetRoleByIdQueryHandler(RoleManager<Role> roleManager, IApplicationDbContext context)
        {
            _roleManager = roleManager;
            _context = context;
        }

        public async Task<RoleDetailsDto> Handle(GetRoleByIdQuery request, CancellationToken cancellationToken)
        {
            var role = await _roleManager.FindByIdAsync(request.Id.ToString());
            if (role == null)
            {
                throw new Exception($"Role with ID {request.Id} was not found.");
            }

            var permissions = await _context.RolePermissions
                .Include(rp => rp.Permission)
                .Where(rp => rp.RoleId == role.Id)
                .Select(rp => new PermissionDetailsDto
                {
                    Id = rp.Permission.Id,
                    Name = rp.Permission.Name,
                    Description = rp.Permission.Description
                })
                .ToListAsync(cancellationToken);

            return new RoleDetailsDto
            {
                Id = role.Id,
                Name = role.Name ?? string.Empty,
                Permissions = permissions
            };
        }
    }
}
