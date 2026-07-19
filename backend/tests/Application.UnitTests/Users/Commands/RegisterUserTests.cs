using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using NSubstitute;
using RealEstate.Application.Users.Commands.RegisterUser;
using RealEstate.Domain.Entities;
using RealEstate.Application.Common.Interfaces;
using Xunit;

namespace RealEstate.Application.UnitTests.Users.Commands
{
    public class RegisterUserTests
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly IEmailSender _emailSender;
        private readonly RegisterUserCommandHandler _handler;

        public RegisterUserTests()
        {
            var store = Substitute.For<IUserStore<User>>();
            _userManager = Substitute.For<UserManager<User>>(store, null, null, null, null, null, null, null, null);

            var roleStore = Substitute.For<IRoleStore<Role>>();
            _roleManager = Substitute.For<RoleManager<Role>>(roleStore, null, null, null, null);

            _emailSender = Substitute.For<IEmailSender>();
            _handler = new RegisterUserCommandHandler(_userManager, _roleManager, _emailSender);
        }

        [Fact]
        public async Task Handle_ValidRequest_ShouldCreateUserAndReturnId()
        {
            // Arrange
            var command = new RegisterUserCommand
            {
                Email = "test@example.com",
                Password = "SecurePassword1!",
                FirstName = "John",
                LastName = "Doe",
                PhoneNumber = "1234567890",
                Role = "Buyer"
            };

            var buyerRole = new Role("Buyer");

            _userManager.CreateAsync(Arg.Any<User>(), Arg.Any<string>())
                .Returns(IdentityResult.Success);

            _userManager.AddToRoleAsync(Arg.Any<User>(), Arg.Any<string>())
                .Returns(IdentityResult.Success);

            _roleManager.FindByNameAsync("Buyer")
                .Returns(buyerRole);

            _userManager.UpdateAsync(Arg.Any<User>())
                .Returns(IdentityResult.Success);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeEmpty();
            await _userManager.Received(1).CreateAsync(Arg.Is<User>(u =>
                u.Email == command.Email &&
                u.FirstName == command.FirstName &&
                u.LastName == command.LastName &&
                u.Role == "Buyer" &&
                !u.IsVerified
            ), command.Password);

            await _userManager.Received(1).AddToRoleAsync(Arg.Any<User>(), "Buyer");
            await _roleManager.Received(1).FindByNameAsync("Buyer");
            await _userManager.Received(1).UpdateAsync(Arg.Is<User>(u => u.ActiveRoleId == buyerRole.Id));
        }

        [Fact]
        public async Task Handle_RegistrationFailed_ShouldThrowException()
        {
            // Arrange
            var command = new RegisterUserCommand
            {
                Email = "test@example.com",
                Password = "SecurePassword1!",
                FirstName = "John",
                LastName = "Doe",
                Role = "Buyer"
            };

            _userManager.CreateAsync(Arg.Any<User>(), Arg.Any<string>())
                .Returns(IdentityResult.Failed(new IdentityError { Description = "Error occurred." }));

            // Act
            Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Registration failed: Error occurred.");
        }
    }
}
