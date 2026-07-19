using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using RealEstate.Domain.Entities;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Users.Commands.LoginUser
{
    public class UserSessionDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public System.Collections.Generic.List<string> AssignedRoles { get; set; } = new();
        public string ActiveRole { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
    }

    public class LoginResult
    {
        public string AccessToken { get; set; } = string.Empty;
        public int ExpiresInSeconds { get; set; }
        public UserSessionDto User { get; set; } = null!;
    }

    public class LoginUserCommand : IRequest<LoginResult>
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginUserCommandValidator : AbstractValidator<LoginUserCommand>
    {
        public LoginUserCommandValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password).NotEmpty();
        }
    }

    public class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, LoginResult>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly IJwtTokenGenerator _tokenGenerator;

        public LoginUserCommandHandler(
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            IJwtTokenGenerator tokenGenerator)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _tokenGenerator = tokenGenerator;
        }

        public async Task<LoginResult> Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            var token = _tokenGenerator.GenerateToken(user);

            // Update last login
            user.LastLogin = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

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

            return new LoginResult
            {
                AccessToken = token,
                ExpiresInSeconds = 3600, // 1 hour
                User = new UserSessionDto
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    Role = user.Role,
                    AssignedRoles = assignedRoles,
                    ActiveRole = activeRole,
                    IsVerified = user.IsVerified
                }
            };
        }
    }
}
