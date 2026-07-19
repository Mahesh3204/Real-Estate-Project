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
    public class ReviewRoleRequestTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly UserManager<User> _userManager;
        private readonly ApproveRoleRequestCommandHandler _approveHandler;
        private readonly RejectRoleRequestCommandHandler _rejectHandler;
        private readonly Guid _adminId;
        private readonly Guid _userId;

        public ReviewRoleRequestTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _adminId = Guid.NewGuid();
            _userId = Guid.NewGuid();

            _currentUserService = Substitute.For<ICurrentUserService>();
            _currentUserService.UserId.Returns(_adminId);

            _context = new ApplicationDbContext(options, _currentUserService);

            var store = Substitute.For<IUserStore<User>>();
            _userManager = Substitute.For<UserManager<User>>(store, null, null, null, null, null, null, null, null);

            _approveHandler = new ApproveRoleRequestCommandHandler(_context, _currentUserService, _userManager);
            _rejectHandler = new RejectRoleRequestCommandHandler(_context, _currentUserService);
        }

        [Fact]
        public async Task Handle_Approve_PendingRequest_ShouldApproveAndAssignRole()
        {
            // Arrange
            var user = new User { Id = _userId, UserName = "buyer@test.com" };
            var sellerRole = new Role("Seller");
            _context.Roles.Add(sellerRole);

            var roleRequest = new RoleRequest
            {
                UserId = _userId,
                User = user,
                RequestedRoleId = sellerRole.Id,
                RequestedRole = sellerRole,
                Status = RoleRequestStatus.Pending
            };
            _context.RoleRequests.Add(roleRequest);
            await _context.SaveChangesAsync();

            _userManager.IsInRoleAsync(user, "Seller").Returns(false);
            _userManager.AddToRoleAsync(user, "Seller").Returns(IdentityResult.Success);

            var command = new ApproveRoleRequestCommand
            {
                RequestId = roleRequest.Id,
                Notes = "Approved by test"
            };

            // Act
            var result = await _approveHandler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();

            var updatedRequest = await _context.RoleRequests.FindAsync(roleRequest.Id);
            updatedRequest.Should().NotBeNull();
            updatedRequest!.Status.Should().Be(RoleRequestStatus.Approved);
            updatedRequest.ReviewedBy.Should().Be(_adminId);
            updatedRequest.ReviewNotes.Should().Be("Approved by test");

            await _userManager.Received(1).AddToRoleAsync(user, "Seller");

            var history = await _context.RoleRequestHistories.FirstOrDefaultAsync(h => h.RequestId == roleRequest.Id);
            history.Should().NotBeNull();
            history!.OldStatus.Should().Be(RoleRequestStatus.Pending);
            history.NewStatus.Should().Be(RoleRequestStatus.Approved);
            history.ChangedBy.Should().Be(_adminId);
        }

        [Fact]
        public async Task Handle_Approve_NonPendingRequest_ShouldThrowException()
        {
            // Arrange
            var user = new User { Id = _userId };
            var sellerRole = new Role("Seller");

            var roleRequest = new RoleRequest
            {
                UserId = _userId,
                User = user,
                RequestedRoleId = sellerRole.Id,
                RequestedRole = sellerRole,
                Status = RoleRequestStatus.Approved
            };
            _context.RoleRequests.Add(roleRequest);
            await _context.SaveChangesAsync();

            var command = new ApproveRoleRequestCommand
            {
                RequestId = roleRequest.Id,
                Notes = "Approve again"
            };

            // Act
            Func<Task> act = async () => await _approveHandler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Only pending requests can be approved.");
        }

        [Fact]
        public async Task Handle_Reject_PendingRequest_ShouldRejectRequest()
        {
            // Arrange
            var user = new User { Id = _userId };
            var sellerRole = new Role("Seller");

            var roleRequest = new RoleRequest
            {
                UserId = _userId,
                User = user,
                RequestedRoleId = sellerRole.Id,
                RequestedRole = sellerRole,
                Status = RoleRequestStatus.Pending
            };
            _context.RoleRequests.Add(roleRequest);
            await _context.SaveChangesAsync();

            var command = new RejectRoleRequestCommand
            {
                RequestId = roleRequest.Id,
                Notes = "Rejected by test"
            };

            // Act
            var result = await _rejectHandler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();

            var updatedRequest = await _context.RoleRequests.FindAsync(roleRequest.Id);
            updatedRequest.Should().NotBeNull();
            updatedRequest!.Status.Should().Be(RoleRequestStatus.Rejected);
            updatedRequest.ReviewedBy.Should().Be(_adminId);
            updatedRequest.ReviewNotes.Should().Be("Rejected by test");

            var history = await _context.RoleRequestHistories.FirstOrDefaultAsync(h => h.RequestId == roleRequest.Id);
            history.Should().NotBeNull();
            history!.OldStatus.Should().Be(RoleRequestStatus.Pending);
            history.NewStatus.Should().Be(RoleRequestStatus.Rejected);
        }

        [Fact]
        public async Task Handle_Reject_NonPendingRequest_ShouldThrowException()
        {
            // Arrange
            var user = new User { Id = _userId };
            var sellerRole = new Role("Seller");

            var roleRequest = new RoleRequest
            {
                UserId = _userId,
                User = user,
                RequestedRoleId = sellerRole.Id,
                RequestedRole = sellerRole,
                Status = RoleRequestStatus.Rejected
            };
            _context.RoleRequests.Add(roleRequest);
            await _context.SaveChangesAsync();

            var command = new RejectRoleRequestCommand
            {
                RequestId = roleRequest.Id,
                Notes = "Reject again"
            };

            // Act
            Func<Task> act = async () => await _rejectHandler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<Exception>().WithMessage("Only pending requests can be rejected.");
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
