using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Offers.Commands.CounterOffer;
using RealEstate.Application.Offers.Commands.SubmitOffer;
using RealEstate.Application.Offers.Commands.UpdateOfferStatus;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using RealEstate.Infrastructure.Data;
using Xunit;

namespace RealEstate.Application.UnitTests.Offers
{
    public class OfferTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly IChatNotificationService _chatNotificationService;

        public OfferTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options, Substitute.For<ICurrentUserService>());
            _chatNotificationService = Substitute.For<IChatNotificationService>();
        }

        [Fact]
        public async Task SubmitOffer_ValidCommand_ShouldSaveOfferAndNotify()
        {
            // Arrange
            var propertyId = Guid.NewGuid();
            var buyerId = Guid.NewGuid();
            var sellerId = Guid.NewGuid();

            var property = new Property
            {
                Id = propertyId,
                OwnerId = sellerId,
                Title = "Negotiable House",
                Price = 250000
            };
            _context.Properties.Add(property);
            await _context.SaveChangesAsync();

            var command = new SubmitOfferCommand
            {
                PropertyId = propertyId,
                BuyerId = buyerId,
                OfferAmount = 240000,
                Message = "Please accept my offer.",
                ExpirationDate = DateTime.UtcNow.AddDays(2)
            };
            var handler = new SubmitOfferCommandHandler(_context, _chatNotificationService);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeEmpty();
            var saved = await _context.Offers.FindAsync(result);
            saved.Should().NotBeNull();
            saved!.OfferAmount.Should().Be(command.OfferAmount);
            saved.Status.Should().Be(OfferStatus.Pending);

            await _chatNotificationService.Received(1).SendNotificationAsync(
                sellerId,
                Arg.Any<Guid>(),
                Arg.Any<string>(),
                (int)NotificationType.OfferReceived,
                Arg.Any<DateTime>());
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
