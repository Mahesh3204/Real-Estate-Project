using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Users.Queries.GetProfile
{
    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string Role { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }

    public class GetUserProfileQuery : IRequest<UserProfileDto>
    {
        public Guid UserId { get; set; }
    }

    public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto>
    {
        private readonly UserManager<User> _userManager;

        public GetUserProfileQueryHandler(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<UserProfileDto> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId.ToString());

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            return new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                IsVerified = user.IsVerified,
                ProfilePictureUrl = user.ProfilePictureUrl
            };
        }
    }
}
