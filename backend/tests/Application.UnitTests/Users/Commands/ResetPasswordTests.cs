using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using NSubstitute;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Users.Commands.ResetPassword;
using RealEstate.Domain.Entities;
using Xunit;

namespace RealEstate.Application.UnitTests.Users.Commands
{
    public class ResetPasswordTests
    {
        private readonly UserManager<User> _userManager;
        private readonly IEmailSender _emailSender;
        private readonly ForgotPasswordCommandHandler _forgotHandler;
        private readonly ResetPasswordCommandHandler _resetHandler;

        public ResetPasswordTests()
        {
            var store = Substitute.For<IUserStore<User>>();
            _userManager = Substitute.For<UserManager<User>>(store, null, null, null, null, null, null, null, null);
            _emailSender = Substitute.For<IEmailSender>();
            var configuration = Substitute.For<Microsoft.Extensions.Configuration.IConfiguration>();
            configuration["FrontendUrl"].Returns("http://localhost:5173");

            _forgotHandler = new ForgotPasswordCommandHandler(_userManager, _emailSender, configuration);
            _resetHandler = new ResetPasswordCommandHandler(_userManager);
        }

        [Fact]
        public async Task ForgotPassword_ValidEmail_ShouldSendEmailWithResetToken()
        {
            // Arrange
            var user = new User { Id = Guid.NewGuid(), Email = "test@example.com" };
            var command = new ForgotPasswordCommand { Email = "test@example.com" };

            _userManager.FindByEmailAsync(command.Email).Returns(user);
            _userManager.GeneratePasswordResetTokenAsync(user).Returns("mocked-reset-token");

            // Act
            var result = await _forgotHandler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            await _emailSender.Received(1).SendEmailAsync(
                command.Email,
                "Reset Password",
                Arg.Is<string>(x => x.Contains("mocked-reset-token"))
            );
        }

        [Fact]
        public async Task ResetPassword_ValidToken_ShouldResetPasswordSuccessfully()
        {
            // Arrange
            var user = new User { Id = Guid.NewGuid(), Email = "test@example.com" };
            var command = new ResetPasswordCommand
            {
                Email = "test@example.com",
                Token = "valid-token",
                NewPassword = "NewSecurePassword1!"
            };

            _userManager.FindByEmailAsync(command.Email).Returns(user);
            _userManager.ResetPasswordAsync(user, command.Token, command.NewPassword)
                .Returns(IdentityResult.Success);

            // Act
            var result = await _resetHandler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            await _userManager.Received(1).ResetPasswordAsync(user, command.Token, command.NewPassword);
        }
    }
}
