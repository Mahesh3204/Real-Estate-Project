using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using NSubstitute;
using RealEstate.Application.Users.Commands.UpdateProfile;
using RealEstate.Application.Users.Queries.GetProfile;
using RealEstate.Domain.Entities;
using Xunit;

namespace RealEstate.Application.UnitTests.Users.Commands
{
    public class UpdateProfileTests
    {
        private readonly UserManager<User> _userManager;
        private readonly UpdateUserProfileCommandHandler _updateHandler;
        private readonly GetUserProfileQueryHandler _getQueryHandler;

        public UpdateProfileTests()
        {
            var store = Substitute.For<IUserStore<User>>();
            _userManager = Substitute.For<UserManager<User>>(store, null, null, null, null, null, null, null, null);
            _updateHandler = new UpdateUserProfileCommandHandler(_userManager);
            _getQueryHandler = new GetUserProfileQueryHandler(_userManager);
        }

        [Fact]
        public async Task Handle_UpdateProfile_ShouldUpdateFieldsSuccessfully()
        {
            // Arrange
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                FirstName = "OldName",
                LastName = "OldLast",
                PhoneNumber = "111"
            };

            var command = new UpdateUserProfileCommand
            {
                UserId = user.Id,
                FirstName = "NewName",
                LastName = "NewLast",
                PhoneNumber = "222"
            };

            _userManager.FindByIdAsync(command.UserId.ToString()).Returns(user);
            _userManager.UpdateAsync(user).Returns(IdentityResult.Success);

            // Act
            var result = await _updateHandler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            user.FirstName.Should().Be("NewName");
            user.LastName.Should().Be("NewLast");
            user.PhoneNumber.Should().Be("222");
            await _userManager.Received(1).UpdateAsync(user);
        }

        [Fact]
        public async Task Handle_GetProfile_ShouldReturnProfileDto()
        {
            // Arrange
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                FirstName = "John",
                LastName = "Doe",
                PhoneNumber = "12345",
                Role = "Buyer"
            };

            var query = new GetUserProfileQuery { UserId = user.Id };

            _userManager.FindByIdAsync(query.UserId.ToString()).Returns(user);

            // Act
            var result = await _getQueryHandler.Handle(query, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.Email.Should().Be(user.Email);
            result.FirstName.Should().Be(user.FirstName);
            result.LastName.Should().Be(user.LastName);
            result.PhoneNumber.Should().Be(user.PhoneNumber);
            result.Role.Should().Be(user.Role);
        }
    }
}
