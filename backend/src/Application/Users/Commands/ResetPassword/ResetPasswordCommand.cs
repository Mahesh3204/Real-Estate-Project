using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Users.Commands.ResetPassword
{
    // Forgot Password
    public class ForgotPasswordCommand : IRequest<bool>
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
    {
        public ForgotPasswordCommandValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
        }
    }

    public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, bool>
    {
        private readonly UserManager<User> _userManager;
        private readonly IEmailSender _emailSender;

        public ForgotPasswordCommandHandler(UserManager<User> userManager, IEmailSender emailSender)
        {
            _userManager = userManager;
            _emailSender = emailSender;
        }

        public async Task<bool> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null)
            {
                // Return true to avoid email enumeration attacks in production
                return true;
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            // Send reset email
            await _emailSender.SendEmailAsync(
                user.Email!,
                "Reset Password Token",
                $"Your password reset token is: {token}. This code can be used to set a new password."
            );

            return true;
        }
    }

    // Reset Password
    public class ResetPasswordCommand : IRequest<bool>
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
    {
        public ResetPasswordCommandValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Token).NotEmpty();
            RuleFor(x => x.NewPassword)
                .NotEmpty()
                .MinimumLength(8)
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
                .Matches(@"[0-9]").WithMessage("Password must contain at least one number.")
                .Matches(@"[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");
        }
    }

    public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, bool>
    {
        private readonly UserManager<User> _userManager;

        public ResetPasswordCommandHandler(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<bool> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", System.Linq.Enumerable.Select(result.Errors, e => e.Description));
                throw new Exception($"Failed to reset password: {errors}");
            }

            return true;
        }
    }
}
