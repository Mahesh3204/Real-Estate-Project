using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using NSubstitute;
using RealEstate.Application.Users.Commands.GoogleLogin;
using RealEstate.Domain.Entities;
using RealEstate.Application.Common.Interfaces;
using Xunit;

namespace RealEstate.Application.UnitTests.Users.Commands
{
    public class GoogleLoginTests
    {
        private readonly UserManager<User> _userManager;
        private readonly IJwtTokenGenerator _tokenGenerator;
        private readonly IGoogleTokenVerifier _googleTokenVerifier;
        private readonly GoogleLoginCommandHandler _handler;

        public GoogleLoginTests()
        {
            var store = Substitute.For<IUserStore<User>>();
            _userManager = Substitute.For<UserManager<User>>(store, null, null, null, null, null, null, null, null);
            _tokenGenerator = Substitute.For<IJwtTokenGenerator>();
            _googleTokenVerifier = Substitute.For<IGoogleTokenVerifier>();
            _handler = new GoogleLoginCommandHandler(_userManager, _tokenGenerator, _googleTokenVerifier);
        }

        [Fact]
        public async Task Handle_ExistingUser_ShouldReturnToken()
        {
            // Arrange
            var command = new GoogleLoginCommand { IdToken = "valid-google-token" };
            var googlePayload = new GoogleUserPayload
            {
                Email = "google@example.com",
                FirstName = "Google",
                LastName = "User"
            };

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = "google@example.com",
                FirstName = "Google",
                LastName = "User",
                Role = "Buyer"
            };

            _googleTokenVerifier.VerifyTokenAsync(command.IdToken).Returns(googlePayload);
            _userManager.FindByEmailAsync(googlePayload.Email).Returns(user);
            _tokenGenerator.GenerateToken(user).Returns("mocked-jwt");

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.AccessToken.Should().Be("mocked-jwt");
            await _userManager.DidNotReceive().CreateAsync(Arg.Any<User>(), Arg.Any<string>());
        }

        [Fact]
        public async Task Handle_NewUser_ShouldCreateUserAndReturnToken()
        {
            // Arrange
            var command = new GoogleLoginCommand { IdToken = "valid-google-token", Role = "Buyer" };
            var googlePayload = new GoogleUserPayload
            {
                Email = "newgoogle@example.com",
                FirstName = "New",
                LastName = "GoogleUser"
            };

            _googleTokenVerifier.VerifyTokenAsync(command.IdToken).Returns(googlePayload);
            _userManager.FindByEmailAsync(googlePayload.Email).Returns((User?)null);
            _userManager.CreateAsync(Arg.Any<User>()).Returns(IdentityResult.Success);
            _tokenGenerator.GenerateToken(Arg.Any<User>()).Returns("mocked-jwt-new");

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.AccessToken.Should().Be("mocked-jwt-new");
            await _userManager.Received(1).CreateAsync(Arg.Is<User>(u =>
                u.Email == googlePayload.Email &&
                u.FirstName == googlePayload.FirstName &&
                u.LastName == googlePayload.LastName &&
                u.Role == command.Role
            ));
        }

        [Fact]
        public async Task Handle_InvalidToken_ShouldThrowException()
        {
            // Arrange
            var command = new GoogleLoginCommand { IdToken = "invalid-token" };
            _googleTokenVerifier.VerifyTokenAsync(command.IdToken).Returns((GoogleUserPayload?)null);

            // Act
            Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Google authentication failed.");
        }
    }
}
