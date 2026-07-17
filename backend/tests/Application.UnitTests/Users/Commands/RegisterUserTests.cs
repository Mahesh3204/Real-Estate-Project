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
        private readonly IEmailSender _emailSender;
        private readonly RegisterUserCommandHandler _handler;

        public RegisterUserTests()
        {
            var store = Substitute.For<IUserStore<User>>();
            _userManager = Substitute.For<UserManager<User>>(store, null, null, null, null, null, null, null, null);
            _emailSender = Substitute.For<IEmailSender>();
            _handler = new RegisterUserCommandHandler(_userManager, _emailSender);
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

            _userManager.CreateAsync(Arg.Any<User>(), Arg.Any<string>())
                .Returns(IdentityResult.Success);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeEmpty();
            await _userManager.Received(1).CreateAsync(Arg.Is<User>(u =>
                u.Email == command.Email &&
                u.FirstName == command.FirstName &&
                u.LastName == command.LastName &&
                u.Role == command.Role &&
                !u.IsVerified
            ), command.Password);
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
