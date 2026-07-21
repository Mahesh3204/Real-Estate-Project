using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Notifications.Commands.MarkNotificationAsRead;
using RealEstate.Application.Notifications.Queries.GetNotifications;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using RealEstate.Infrastructure.Data;
using Xunit;

namespace RealEstate.Application.UnitTests.Notifications
{
    public class NotificationTests : IDisposable
    {
        private readonly ApplicationDbContext _context;

        public NotificationTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options, NSubstitute.Substitute.For<RealEstate.Application.Common.Interfaces.ICurrentUserService>());
        }

        [Fact]
        public async Task GetNotifications_ShouldReturnRecipientNotifications()
        {
            // Arrange
            var userId = Guid.NewGuid();
            _context.Notifications.AddRange(
                new Notification { RecipientId = userId, Content = "Note 1", Type = NotificationType.NewInquiry, IsRead = false },
                new Notification { RecipientId = userId, Content = "Note 2", Type = NotificationType.NewMessage, IsRead = true },
                new Notification { RecipientId = Guid.NewGuid(), Content = "Other", Type = NotificationType.OfferReceived, IsRead = false }
            );
            await _context.SaveChangesAsync();

            var query = new GetNotificationsQuery { UserId = userId };
            var handler = new GetNotificationsQueryHandler(_context);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            result.Should().HaveCount(2);
        }

        [Fact]
        public async Task MarkAsRead_ValidCommand_ShouldMarkNotificationAsRead()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var notification = new Notification { RecipientId = userId, Content = "Unread message", Type = NotificationType.NewMessage, IsRead = false };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            var command = new MarkNotificationAsReadCommand { NotificationId = notification.Id, UserId = userId, MarkAll = false };
            var handler = new MarkNotificationAsReadCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            var updated = await _context.Notifications.FindAsync(notification.Id);
            updated!.IsRead.Should().BeTrue();
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
