using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using RealEstate.Domain.Entities;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Users.Commands.RegisterUser
{
    public class RegisterUserCommand : IRequest<Guid>
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string Role { get; set; } = "Buyer"; // "Admin", "Agent", "Buyer", "Seller"
    }

    public class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
    {
        public RegisterUserCommandValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password)
                .NotEmpty()
                .MinimumLength(8)
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
                .Matches(@"[0-9]").WithMessage("Password must contain at least one number.")
                .Matches(@"[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Role).Must(role => role is "Admin" or "Agent" or "Buyer" or "Seller")
                .WithMessage("Role must be one of the following: Admin, Agent, Buyer, Seller.");
        }
    }

    public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, Guid>
    {
        private readonly UserManager<User> _userManager;
        private readonly IEmailSender _emailSender;

        public RegisterUserCommandHandler(UserManager<User> userManager, IEmailSender emailSender)
        {
            _userManager = userManager;
            _emailSender = emailSender;
        }

        public async Task<Guid> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {
            var user = new User
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber,
                Role = request.Role,
                IsVerified = false // Must verify email OTP
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", System.Linq.Enumerable.Select(result.Errors, e => e.Description));
                throw new Exception($"Registration failed: {errors}");
            }

            // Generate OTP
            var random = new Random();
            var otp = random.Next(100000, 999999).ToString();

            // Save OTP token
            await _userManager.SetAuthenticationTokenAsync(user, "Default", "EmailVerificationOtp", otp);

            // Send OTP email
            await _emailSender.SendEmailAsync(user.Email, "Email Verification OTP", $"Your verification code is {otp}. This code is valid for 10 minutes.");

            return user.Id;
        }
    }
}
