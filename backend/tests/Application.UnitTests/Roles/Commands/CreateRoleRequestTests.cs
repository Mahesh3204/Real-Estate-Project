using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Roles.Commands;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using RealEstate.Infrastructure.Data;
using Xunit;

namespace RealEstate.Application.UnitTests.Roles.Commands
{
    public class CreateRoleRequestTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly CreateRoleRequestCommandHandler _handler;
        private readonly Guid _userId;

        public CreateRoleRequestTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _userId = Guid.NewGuid();
            _currentUserService = Substitute.For<ICurrentUserService>();
            _currentUserService.UserId.Returns(_userId);

            _context = new ApplicationDbContext(options, _currentUserService);

            var store = Substitute.For<IUserStore<User>>();
            _userManager = Substitute.For<UserManager<User>>(store, null, null, null, null, null, null, null, null);

            var roleStore = Substitute.For<IRoleStore<Role>>();
            _roleManager = Substitute.For<RoleManager<Role>>(roleStore, null, null, null, null);

            _handler = new CreateRoleRequestCommandHandler(_context, _currentUserService, _userManager, _roleManager);
        }

        [Fact]
        public async Task Handle_ValidRequest_ManualApproval_ShouldCreatePendingRequest()
        {
            // Arrange
            var user = new User { Id = _userId, UserName = "buyer@test.com" };
            var sellerRole = new Role("Seller");

            _userManager.FindByIdAsync(_userId.ToString()).Returns(user);
            _roleManager.FindByNameAsync("Seller").Returns(sellerRole);
            _userManager.IsInRoleAsync(user, "Seller").Returns(false);

            var command = new CreateRoleRequestCommand
            {
                RequestedRoleName = "Seller",
                Reason = "I want to sell my home."
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeEmpty();

            var request = await _context.RoleRequests.FirstOrDefaultAsync(r => r.Id == result);
            request.Should().NotBeNull();
            request!.UserId.Should().Be(_userId);
            request.RequestedRoleId.Should().Be(sellerRole.Id);
            request.Status.Should().Be(RoleRequestStatus.Pending);
            request.Reason.Should().Be(command.Reason);

            var history = await _context.RoleRequestHistories.FirstOrDefaultAsync(h => h.RequestId == result);
            history.Should().NotBeNull();
            history!.OldStatus.Should().Be(RoleRequestStatus.Pending);
            history.NewStatus.Should().Be(RoleRequestStatus.Pending);
        }

        [Fact]
        public async Task Handle_ValidRequest_AutoApproval_ShouldApproveAndAssignRole()
        {
            // Arrange
            var user = new User { Id = _userId, UserName = "buyer@test.com" };
            var sellerRole = new Role("Seller");

            _context.SystemSettings.Add(new SystemSetting { Key = "AutoApproveRoleRequests", Value = "true" });
            await _context.SaveChangesAsync();

            _userManager.FindByIdAsync(_userId.ToString()).Returns(user);
            _roleManager.FindByNameAsync("Seller").Returns(sellerRole);
            _userManager.IsInRoleAsync(user, "Seller").Returns(false);
            _userManager.AddToRoleAsync(user, "Seller").Returns(IdentityResult.Success);

            var command = new CreateRoleRequestCommand
            {
                RequestedRoleName = "Seller",
                Reason = "I want to sell my home."
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeEmpty();

            var request = await _context.RoleRequests.FirstOrDefaultAsync(r => r.Id == result);
            request.Should().NotBeNull();
            request!.Status.Should().Be(RoleRequestStatus.Approved);

            await _userManager.Received(1).AddToRoleAsync(user, "Seller");

            var history = await _context.RoleRequestHistories.FirstOrDefaultAsync(h => h.RequestId == result);
            history.Should().NotBeNull();
            history!.NewStatus.Should().Be(RoleRequestStatus.Approved);
        }

        [Fact]
        public async Task Handle_UserAlreadyHasRole_ShouldThrowValidationException()
        {
            // Arrange
            var user = new User { Id = _userId, UserName = "buyer@test.com" };
            var sellerRole = new Role("Seller");

            _userManager.FindByIdAsync(_userId.ToString()).Returns(user);
            _roleManager.FindByNameAsync("Seller").Returns(sellerRole);
            _userManager.IsInRoleAsync(user, "Seller").Returns(true);

            var command = new CreateRoleRequestCommand
            {
                RequestedRoleName = "Seller",
                Reason = "Reason"
            };

            // Act
            Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<RealEstate.Application.Common.Exceptions.ValidationException>();
        }

        [Fact]
        public async Task Handle_PendingRequestExists_ShouldThrowValidationException()
        {
            // Arrange
            var user = new User { Id = _userId, UserName = "buyer@test.com" };
            var sellerRole = new Role("Seller");

            var existingRequest = new RoleRequest
            {
                UserId = _userId,
                RequestedRoleId = sellerRole.Id,
                Status = RoleRequestStatus.Pending
            };
            _context.RoleRequests.Add(existingRequest);
            await _context.SaveChangesAsync();

            _userManager.FindByIdAsync(_userId.ToString()).Returns(user);
            _roleManager.FindByNameAsync("Seller").Returns(sellerRole);
            _userManager.IsInRoleAsync(user, "Seller").Returns(false);

            var command = new CreateRoleRequestCommand
            {
                RequestedRoleName = "Seller",
                Reason = "Reason"
            };

            // Act
            Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<RealEstate.Application.Common.Exceptions.ValidationException>();
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
