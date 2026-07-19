using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using NSubstitute;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Roles.Commands;
using RealEstate.Domain.Entities;
using Xunit;

namespace RealEstate.Application.UnitTests.Roles.Commands
{
    public class SwitchActiveRoleTests
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly SwitchActiveRoleCommandHandler _handler;
        private readonly Guid _userId;

        public SwitchActiveRoleTests()
        {
            _userId = Guid.NewGuid();
            _currentUserService = Substitute.For<ICurrentUserService>();
            _currentUserService.UserId.Returns(_userId);

            var store = Substitute.For<IUserStore<User>>();
            _userManager = Substitute.For<UserManager<User>>(store, null, null, null, null, null, null, null, null);

            var roleStore = Substitute.For<IRoleStore<Role>>();
            _roleManager = Substitute.For<RoleManager<Role>>(roleStore, null, null, null, null);

            _handler = new SwitchActiveRoleCommandHandler(_currentUserService, _userManager, _roleManager);
        }

        [Fact]
        public async Task Handle_ValidSwitch_ShouldUpdateActiveRole()
        {
            // Arrange
            var user = new User { Id = _userId, UserName = "buyer@test.com" };
            var sellerRole = new Role("Seller");

            _userManager.FindByIdAsync(_userId.ToString()).Returns(user);
            _userManager.IsInRoleAsync(user, "Seller").Returns(true);
            _roleManager.FindByNameAsync("Seller").Returns(sellerRole);
            _userManager.UpdateAsync(user).Returns(IdentityResult.Success);

            var command = new SwitchActiveRoleCommand { RoleName = "Seller" };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().Be("Seller");
            user.ActiveRoleId.Should().Be(sellerRole.Id);
            await _userManager.Received(1).UpdateAsync(user);
        }

        [Fact]
        public async Task Handle_UserDoesNotHaveRole_ShouldThrowValidationException()
        {
            // Arrange
            var user = new User { Id = _userId, UserName = "buyer@test.com" };

            _userManager.FindByIdAsync(_userId.ToString()).Returns(user);
            _userManager.IsInRoleAsync(user, "Seller").Returns(false);

            var command = new SwitchActiveRoleCommand { RoleName = "Seller" };

            // Act
            Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<RealEstate.Application.Common.Exceptions.ValidationException>();
        }

        [Fact]
        public async Task Handle_RoleDoesNotExist_ShouldThrowException()
        {
            // Arrange
            var user = new User { Id = _userId, UserName = "buyer@test.com" };

            _userManager.FindByIdAsync(_userId.ToString()).Returns(user);
            _userManager.IsInRoleAsync(user, "Seller").Returns(true);
            _roleManager.FindByNameAsync("Seller").Returns((Role?)null);

            var command = new SwitchActiveRoleCommand { RoleName = "Seller" };

            // Act
            Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Role 'Seller' does not exist in the system.");
        }
    }
}
