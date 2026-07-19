using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Users.Commands.LoginUser;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Users.Commands.GoogleLogin
{
    public class GoogleLoginCommand : IRequest<LoginResult>
    {
        public string IdToken { get; set; } = string.Empty;
        public string Role { get; set; } = "Buyer"; // Fallback role for new users
    }

    public class GoogleLoginCommandValidator : AbstractValidator<GoogleLoginCommand>
    {
        public GoogleLoginCommandValidator()
        {
            RuleFor(x => x.IdToken).NotEmpty();
            RuleFor(x => x.Role).Must(role => role is "Admin" or "Agent" or "Buyer" or "Seller")
                .WithMessage("Role must be one of the following: Admin, Agent, Buyer, Seller.");
        }
    }

    public class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, LoginResult>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly IJwtTokenGenerator _tokenGenerator;
        private readonly IGoogleTokenVerifier _googleTokenVerifier;

        public GoogleLoginCommandHandler(
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            IJwtTokenGenerator tokenGenerator,
            IGoogleTokenVerifier googleTokenVerifier)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _tokenGenerator = tokenGenerator;
            _googleTokenVerifier = googleTokenVerifier;
        }

        public async Task<LoginResult> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
        {
            var googlePayload = await _googleTokenVerifier.VerifyTokenAsync(request.IdToken);

            if (googlePayload == null)
            {
                throw new Exception("Google authentication failed.");
            }

            var user = await _userManager.FindByEmailAsync(googlePayload.Email);

            if (user == null)
            {
                user = new User
                {
                    UserName = googlePayload.Email,
                    Email = googlePayload.Email,
                    FirstName = googlePayload.FirstName,
                    LastName = googlePayload.LastName,
                    Role = "Buyer", // Force default role Buyer per spec
                    IsVerified = true, // Google accounts verified by default
                    ProfilePictureUrl = googlePayload.PictureUrl
                };

                var result = await _userManager.CreateAsync(user);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", System.Linq.Enumerable.Select(result.Errors, e => e.Description));
                    throw new Exception($"Failed to provision Google account: {errors}");
                }

                // Add to standard role "Buyer"
                await _userManager.AddToRoleAsync(user, "Buyer");

                // Set ActiveRoleId
                var buyerRole = await _roleManager.FindByNameAsync("Buyer");
                if (buyerRole != null)
                {
                    user.ActiveRoleId = buyerRole.Id;
                    await _userManager.UpdateAsync(user);
                }
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
                ExpiresInSeconds = 3600,
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
