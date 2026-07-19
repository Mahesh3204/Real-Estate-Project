using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Users.Queries.GetProfile
{
    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Role { get; set; } = string.Empty;
        public System.Collections.Generic.List<string> AssignedRoles { get; set; } = new();
        public string ActiveRole { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }

        public Guid? CountryId { get; set; }
        public string? CountryName { get; set; }

        public Guid? StateId { get; set; }
        public string? StateName { get; set; }

        public Guid? CityId { get; set; }
        public string? CityName { get; set; }

        public string? Area { get; set; }
        public string? ZipCode { get; set; }
        public string Language { get; set; } = "en";
        public string Timezone { get; set; } = "UTC";
    }

    public class GetUserProfileQuery : IRequest<UserProfileDto>
    {
        public Guid UserId { get; set; }
    }

    public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly IApplicationDbContext _context;

        public GetUserProfileQueryHandler(
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            IApplicationDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }

        public async Task<UserProfileDto> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            var profile = await _context.Profiles
                .Include(p => p.Country)
                .Include(p => p.State)
                .Include(p => p.City)
                .FirstOrDefaultAsync(p => p.Id == request.UserId, cancellationToken);

            if (profile == null)
            {
                profile = new Profile
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Phone = user.PhoneNumber,
                    AvatarUrl = user.ProfilePictureUrl
                };
                _context.Profiles.Add(profile);
                await _context.SaveChangesAsync(cancellationToken);
            }

            var assignedRoles = (await _userManager.GetRolesAsync(user)).ToList();
            var activeRole = string.Empty;
            if (user.ActiveRoleId.HasValue)
            {
                var roleObj = await _roleManager.FindByIdAsync(user.ActiveRoleId.Value.ToString());
                activeRole = roleObj?.Name ?? string.Empty;
            }
            if (string.IsNullOrEmpty(activeRole) && assignedRoles.Count > 0)
            {
                activeRole = assignedRoles[0]; // fallback
            }

            return new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = profile.FirstName,
                LastName = profile.LastName,
                Phone = profile.Phone,
                Role = user.Role,
                AssignedRoles = assignedRoles,
                ActiveRole = activeRole,
                IsVerified = user.IsVerified,
                AvatarUrl = profile.AvatarUrl,
                Gender = profile.Gender,
                DateOfBirth = profile.DateOfBirth,
                CountryId = profile.CountryId,
                CountryName = profile.Country?.Name,
                StateId = profile.StateId,
                StateName = profile.State?.Name,
                CityId = profile.CityId,
                CityName = profile.City?.Name,
                Area = profile.Area,
                ZipCode = profile.ZipCode,
                Language = profile.Language,
                Timezone = profile.Timezone
            };
        }
    }
}
