using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Roles.Queries;

namespace RealEstate.Application.Permissions.Queries
{
    public class PermissionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class GetPermissionsQuery : IRequest<PaginatedList<PermissionDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }
        public string SortBy { get; set; } = "name";
        public string SortOrder { get; set; } = "asc";
    }

    public class GetPermissionsQueryHandler : IRequestHandler<GetPermissionsQuery, PaginatedList<PermissionDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetPermissionsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedList<PermissionDto>> Handle(GetPermissionsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Permissions.AsNoTracking();

            // Search filter
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                string search = request.SearchTerm.ToLowerInvariant();
                query = query.Where(p => p.Name.ToLower().Contains(search) || p.Description.ToLower().Contains(search));
            }

            // Sorting
            bool isDesc = request.SortOrder.Equals("desc", StringComparison.OrdinalIgnoreCase);
            query = request.SortBy.ToLowerInvariant() switch
            {
                "id" => isDesc ? query.OrderByDescending(p => p.Id) : query.OrderBy(p => p.Id),
                "description" => isDesc ? query.OrderByDescending(p => p.Description) : query.OrderBy(p => p.Description),
                _ => isDesc ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name)
            };

            int count = await query.CountAsync(cancellationToken);

            var permissions = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description
                })
                .ToListAsync(cancellationToken);

            return new PaginatedList<PermissionDto>(permissions, count, request.PageNumber, request.PageSize);
        }
    }
}
