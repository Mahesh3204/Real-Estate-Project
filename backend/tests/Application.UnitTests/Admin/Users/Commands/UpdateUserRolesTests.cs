using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using NSubstitute;
using RealEstate.Application.Admin.Users.Commands;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using Xunit;

namespace RealEstate.Application.UnitTests.Admin.Users.Commands
{
    public class UpdateUserRolesTests
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly ICurrentUserService _currentUserService;
        private readonly UpdateUserRolesCommandHandler _handler;
        private readonly Guid _adminId;

        public UpdateUserRolesTests()
        {
            _adminId = Guid.NewGuid();
            _currentUserService = Substitute.For<ICurrentUserService>();
            _currentUserService.UserId.Returns(_adminId);

            var store = Substitute.For<IUserStore<User>>();
            _userManager = Substitute.For<UserManager<User>>(store, null, null, null, null, null, null, null, null);

            var roleStore = Substitute.For<IRoleStore<Role>>();
            _roleManager = Substitute.For<RoleManager<Role>>(roleStore, null, null, null, null);

            _handler = new UpdateUserRolesCommandHandler(_userManager, _roleManager, _currentUserService);
        }

        [Fact]
        public async Task Handle_ValidUpdate_ShouldUpdateUserRoles()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var user = new User { Id = userId, UserName = "user@test.com" };

            _userManager.FindByIdAsync(userId.ToString()).Returns(user);
            _userManager.GetRolesAsync(user).Returns(new List<string> { "Buyer" });
            _roleManager.RoleExistsAsync("Buyer").Returns(true);
            _roleManager.RoleExistsAsync("Seller").Returns(true);

            _userManager.RemoveFromRolesAsync(user, Arg.Any<IEnumerable<string>>()).Returns(IdentityResult.Success);
            _userManager.AddToRolesAsync(user, Arg.Any<IEnumerable<string>>()).Returns(IdentityResult.Success);

            var command = new UpdateUserRolesCommand
            {
                UserId = userId,
                Roles = new List<string> { "Buyer", "Seller" }
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            await _userManager.Received(1).AddToRolesAsync(user, Arg.Is<IEnumerable<string>>(r => System.Linq.Enumerable.Contains(r, "Seller")));
        }

        [Fact]
        public async Task Handle_SelfDemotion_ShouldThrowValidationException()
        {
            // Arrange
            var user = new User { Id = _adminId, UserName = "admin@test.com" };

            _userManager.FindByIdAsync(_adminId.ToString()).Returns(user);
            _userManager.GetRolesAsync(user).Returns(new List<string> { "Admin", "Buyer" });

            var command = new UpdateUserRolesCommand
            {
                UserId = _adminId,
                Roles = new List<string> { "Buyer" }
            };

            // Act
            Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

            // Assert
            var exception = await act.Should().ThrowAsync<RealEstate.Application.Common.Exceptions.ValidationException>();
            exception.Which.Errors.Should().ContainKey("Roles");
        }
    }
}
