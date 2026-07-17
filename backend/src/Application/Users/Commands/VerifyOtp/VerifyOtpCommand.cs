using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Users.Commands.VerifyOtp
{
    public class VerifyOtpCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
        public string OtpCode { get; set; } = string.Empty;
    }

    public class VerifyOtpCommandValidator : AbstractValidator<VerifyOtpCommand>
    {
        public VerifyOtpCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.OtpCode).NotEmpty().Length(6);
        }
    }

    public class VerifyOtpCommandHandler : IRequestHandler<VerifyOtpCommand, bool>
    {
        private readonly UserManager<User> _userManager;

        public VerifyOtpCommandHandler(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<bool> Handle(VerifyOtpCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId.ToString());

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            var savedOtp = await _userManager.GetAuthenticationTokenAsync(user, "Default", "EmailVerificationOtp");

            if (savedOtp == null || savedOtp != request.OtpCode)
            {
                throw new Exception("Invalid or expired OTP code.");
            }

            // Verify the user
            user.IsVerified = true;
            var updateResult = await _userManager.UpdateAsync(user);

            if (!updateResult.Succeeded)
            {
                throw new Exception("Failed to update user verification state.");
            }

            // Clear the OTP token
            await _userManager.RemoveAuthenticationTokenAsync(user, "Default", "EmailVerificationOtp");

            return true;
        }
    }
}
