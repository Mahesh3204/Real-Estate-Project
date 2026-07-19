using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Roles.Queries;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Admin.Users.Queries
{
    public class UserDetailsDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public List<string> AssignedRoles { get; set; } = new();
        public string ActiveRole { get; set; } = string.Empty;
    }

    public class GetUsersQuery : IRequest<PaginatedListDto<UserDetailsDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchQuery { get; set; }
    }

    public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, PaginatedListDto<UserDetailsDto>>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;

        public GetUsersQueryHandler(UserManager<User> userManager, RoleManager<Role> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<PaginatedListDto<UserDetailsDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
        {
            var query = _userManager.Users;

            if (!string.IsNullOrEmpty(request.SearchQuery))
            {
                var search = request.SearchQuery.ToLower();
                query = query.Where(u => u.Email!.ToLower().Contains(search) ||
                                         u.FirstName.ToLower().Contains(search) ||
                                         u.LastName.ToLower().Contains(search));
            }

            var totalRecords = await query.CountAsync(cancellationToken);

            var users = await query
                .OrderBy(u => u.Email)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            var userDtos = new List<UserDetailsDto>();

            foreach (var user in users)
            {
                var roles = (await _userManager.GetRolesAsync(user)).ToList();
                var activeRole = string.Empty;

                if (user.ActiveRoleId.HasValue)
                {
                    var roleObj = await _roleManager.FindByIdAsync(user.ActiveRoleId.Value.ToString());
                    activeRole = roleObj?.Name ?? string.Empty;
                }

                userDtos.Add(new UserDetailsDto
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    AssignedRoles = roles,
                    ActiveRole = activeRole
                });
            }

            var totalPages = (int)Math.Ceiling(totalRecords / (double)request.PageSize);

            return new PaginatedListDto<UserDetailsDto>
            {
                Items = userDtos,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalRecords = totalRecords,
                TotalPages = totalPages
            };
        }
    }
}
