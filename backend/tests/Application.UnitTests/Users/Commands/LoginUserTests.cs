using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using NSubstitute;
using RealEstate.Application.Users.Commands.LoginUser;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using Xunit;

namespace RealEstate.Application.UnitTests.Users.Commands
{
    public class LoginUserTests
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly IJwtTokenGenerator _tokenGenerator;
        private readonly LoginUserCommandHandler _handler;

        public LoginUserTests()
        {
            var store = Substitute.For<IUserStore<User>>();
            _userManager = Substitute.For<UserManager<User>>(store, null, null, null, null, null, null, null, null);
            var roleStore = Substitute.For<IRoleStore<Role>>();
            _roleManager = Substitute.For<RoleManager<Role>>(roleStore, null, null, null, null);
            _tokenGenerator = Substitute.For<IJwtTokenGenerator>();
            _handler = new LoginUserCommandHandler(_userManager, _roleManager, _tokenGenerator);
        }

        [Fact]
        public async Task Handle_ValidCredentials_ShouldReturnTokenAndUserSession()
        {
            // Arrange
            var command = new LoginUserCommand
            {
                Email = "test@example.com",
                Password = "SecurePassword1!"
            };

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                FirstName = "John",
                LastName = "Doe",
                Role = "Buyer",
                IsVerified = true
            };

            _userManager.FindByEmailAsync(command.Email).Returns(user);
            _userManager.CheckPasswordAsync(user, command.Password).Returns(true);
            _tokenGenerator.GenerateToken(user).Returns("mocked-jwt-token");

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.AccessToken.Should().Be("mocked-jwt-token");
            result.User.Email.Should().Be(user.Email);
            result.User.Role.Should().Be(user.Role);
            result.User.IsVerified.Should().BeTrue();
        }

        [Fact]
        public async Task Handle_InvalidPassword_ShouldThrowException()
        {
            // Arrange
            var command = new LoginUserCommand
            {
                Email = "test@example.com",
                Password = "WrongPassword!"
            };

            var user = new User { Email = "test@example.com" };

            _userManager.FindByEmailAsync(command.Email).Returns(user);
            _userManager.CheckPasswordAsync(user, command.Password).Returns(false);

            // Act
            Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Invalid email or password.");
        }
    }
}
