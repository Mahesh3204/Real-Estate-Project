using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using NSubstitute;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Users.Commands.VerifyOtp;
using RealEstate.Domain.Entities;
using Xunit;

namespace RealEstate.Application.UnitTests.Users.Commands
{
    public class VerifyOtpTests
    {
        private readonly UserManager<User> _userManager;
        private readonly VerifyOtpCommandHandler _handler;

        public VerifyOtpTests()
        {
            var store = Substitute.For<IUserStore<User>>();
            _userManager = Substitute.For<UserManager<User>>(store, null, null, null, null, null, null, null, null);
            _handler = new VerifyOtpCommandHandler(_userManager);
        }

        [Fact]
        public async Task Handle_ValidOtp_ShouldVerifyUserAndClearToken()
        {
            // Arrange
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                IsVerified = false
            };

            var command = new VerifyOtpCommand
            {
                UserId = user.Id,
                OtpCode = "123456"
            };

            _userManager.FindByIdAsync(command.UserId.ToString()).Returns(user);
            _userManager.GetAuthenticationTokenAsync(user, "Default", "EmailVerificationOtp").Returns("123456");
            _userManager.UpdateAsync(user).Returns(IdentityResult.Success);
            _userManager.RemoveAuthenticationTokenAsync(user, "Default", "EmailVerificationOtp").Returns(IdentityResult.Success);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            user.IsVerified.Should().BeTrue();
            await _userManager.Received(1).UpdateAsync(user);
            await _userManager.Received(1).RemoveAuthenticationTokenAsync(user, "Default", "EmailVerificationOtp");
        }

        [Fact]
        public async Task Handle_InvalidOtp_ShouldThrowException()
        {
            // Arrange
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                IsVerified = false
            };

            var command = new VerifyOtpCommand
            {
                UserId = user.Id,
                OtpCode = "wrong"
            };

            _userManager.FindByIdAsync(command.UserId.ToString()).Returns(user);
            _userManager.GetAuthenticationTokenAsync(user, "Default", "EmailVerificationOtp").Returns("123456");

            // Act
            Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Invalid or expired OTP code.");
            user.IsVerified.Should().BeFalse();
        }
    }
}
