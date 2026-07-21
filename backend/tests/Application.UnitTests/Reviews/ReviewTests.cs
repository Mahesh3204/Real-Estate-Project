using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Reviews.Commands.ReplyToReview;
using RealEstate.Application.Reviews.Commands.ReportReview;
using RealEstate.Application.Reviews.Commands.SubmitReview;
using RealEstate.Application.Reviews.Queries.GetReviews;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using RealEstate.Infrastructure.Data;
using Xunit;

namespace RealEstate.Application.UnitTests.Reviews
{
    public class ReviewTests : IDisposable
    {
        private readonly ApplicationDbContext _context;

        public ReviewTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options, Substitute.For<ICurrentUserService>());
        }

        [Fact]
        public async Task SubmitReview_WithoutCompletedVisit_ShouldThrow()
        {
            // Arrange
            var buyerId = Guid.NewGuid();
            var propertyId = Guid.NewGuid();

            var command = new SubmitReviewCommand
            {
                PropertyId = propertyId,
                SellerId = Guid.NewGuid(),
                BuyerId = buyerId,
                Rating = 5,
                Comment = "Great property for the price!"
            };

            var handler = new SubmitReviewCommandHandler(_context);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task SubmitReview_WithCompletedVisit_ShouldSucceed()
        {
            // Arrange
            var buyerId = Guid.NewGuid();
            var sellerId = Guid.NewGuid();
            var propertyId = Guid.NewGuid();

            _context.Appointments.Add(new Appointment
            {
                BuyerId = buyerId,
                SellerId = sellerId,
                PropertyId = propertyId,
                ScheduledAt = DateTime.UtcNow.AddDays(-3),
                Status = AppointmentStatus.Completed
            });
            await _context.SaveChangesAsync();

            var command = new SubmitReviewCommand
            {
                PropertyId = propertyId,
                SellerId = sellerId,
                BuyerId = buyerId,
                Rating = 4,
                Comment = "Excellent property, very clean!"
            };

            var handler = new SubmitReviewCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.Rating.Should().Be(4);
        }

        [Fact]
        public async Task ReplyToReview_BySeller_ShouldUpdateReply()
        {
            // Arrange
            var sellerId = Guid.NewGuid();
            var review = new Review
            {
                BuyerId = Guid.NewGuid(),
                SellerId = sellerId,
                PropertyId = Guid.NewGuid(),
                Rating = 3,
                Comment = "Average property."
            };
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var command = new ReplyToReviewCommand
            {
                ReviewId = review.Id,
                SellerId = sellerId,
                ReplyMessage = "Thank you for your feedback!"
            };

            var handler = new ReplyToReviewCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            var updated = await _context.Reviews.FindAsync(review.Id);
            updated!.ReplyContent.Should().Be("Thank you for your feedback!");
        }

        [Fact]
        public async Task ReportReview_ShouldMarkAsReported()
        {
            // Arrange
            var review = new Review
            {
                BuyerId = Guid.NewGuid(),
                SellerId = Guid.NewGuid(),
                PropertyId = Guid.NewGuid(),
                Rating = 1,
                Comment = "Offensive content here."
            };
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var command = new ReportReviewCommand { ReviewId = review.Id, Reason = "Inappropriate" };
            var handler = new ReportReviewCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            var updated = await _context.Reviews.FindAsync(review.Id);
            updated!.IsReported.Should().BeTrue();
        }

        [Fact]
        public async Task GetReviews_BySellerWithDistribution_ShouldReturnSummary()
        {
            // Arrange
            var sellerId = Guid.NewGuid();
            var propId = Guid.NewGuid();
            _context.Reviews.AddRange(
                new Review { SellerId = sellerId, PropertyId = propId, BuyerId = Guid.NewGuid(), Rating = 5, Comment = "Excellent!", IsHidden = false },
                new Review { SellerId = sellerId, PropertyId = propId, BuyerId = Guid.NewGuid(), Rating = 4, Comment = "Very good experience.", IsHidden = false },
                new Review { SellerId = sellerId, PropertyId = propId, BuyerId = Guid.NewGuid(), Rating = 3, Comment = "Average overall.", IsHidden = false }
            );
            await _context.SaveChangesAsync();

            var query = new GetReviewsQuery { SellerId = sellerId };
            var handler = new GetReviewsQueryHandler(_context);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.TotalReviews.Should().Be(3);
            result.AverageRating.Should().BeApproximately(4.0, 0.1);
            result.Distribution[5].Should().Be(1);
            result.Distribution[4].Should().Be(1);
            result.Distribution[3].Should().Be(1);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
