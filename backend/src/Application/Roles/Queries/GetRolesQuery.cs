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
    public class RoleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<string> Permissions { get; set; } = new();
    }

    public class PaginatedList<T>
    {
        public List<T> Items { get; }
        public int PageNumber { get; }
        public int PageSize { get; }
        public int TotalRecords { get; }
        public int TotalPages { get; }

        public PaginatedList(List<T> items, int count, int pageNumber, int pageSize)
        {
            PageNumber = pageNumber;
            PageSize = pageSize;
            TotalRecords = count;
            TotalPages = (int)Math.Ceiling(count / (double)pageSize);
            Items = items;
        }
    }

    public class GetRolesQuery : IRequest<PaginatedList<RoleDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }
        public string SortBy { get; set; } = "name";
        public string SortOrder { get; set; } = "asc"; // asc or desc
    }

    public class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, PaginatedList<RoleDto>>
    {
        private readonly RoleManager<Role> _roleManager;
        private readonly IApplicationDbContext _context;

        public GetRolesQueryHandler(RoleManager<Role> roleManager, IApplicationDbContext context)
        {
            _roleManager = roleManager;
            _context = context;
        }

        public async Task<PaginatedList<RoleDto>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
        {
            var query = _roleManager.Roles.AsQueryable();

            // Search filter
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                string search = request.SearchTerm.ToLowerInvariant();
                query = query.Where(r => r.Name != null && r.Name.ToLower().Contains(search));
            }

            // Sorting
            bool isDesc = request.SortOrder.Equals("desc", StringComparison.OrdinalIgnoreCase);
            query = request.SortBy.ToLowerInvariant() switch
            {
                "id" => isDesc ? query.OrderByDescending(r => r.Id) : query.OrderBy(r => r.Id),
                _ => isDesc ? query.OrderByDescending(r => r.Name) : query.OrderBy(r => r.Name)
            };

            int count = await query.CountAsync(cancellationToken);

            // Pagination
            var roles = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Retrieve permission mappings
            var roleIds = roles.Select(r => r.Id).ToList();
            var rolePermissions = await _context.RolePermissions
                .Include(rp => rp.Permission)
                .Where(rp => roleIds.Contains(rp.RoleId))
                .ToListAsync(cancellationToken);

            var items = roles.Select(role => new RoleDto
            {
                Id = role.Id,
                Name = role.Name ?? string.Empty,
                Permissions = rolePermissions
                    .Where(rp => rp.RoleId == role.Id)
                    .Select(rp => rp.Permission.Name)
                    .ToList()
            }).ToList();

            return new PaginatedList<RoleDto>(items, count, request.PageNumber, request.PageSize);
        }
    }
}
