using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Inquiries.Commands.CreateInquiry;
using RealEstate.Application.Inquiries.Commands.UpdateInquiryStatus;
using RealEstate.Application.Inquiries.Queries.GetInquiryHistory;
using RealEstate.Domain.Entities;
using RealEstate.Infrastructure.Data;
using Xunit;

namespace RealEstate.Application.UnitTests.Inquiries
{
    public class InquiryTests : IDisposable
    {
        private readonly ApplicationDbContext _context;

        public InquiryTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options, NSubstitute.Substitute.For<RealEstate.Application.Common.Interfaces.ICurrentUserService>());

        }

        [Fact]
        public async Task CreateInquiry_ValidCommand_ShouldSaveInquiry()
        {
            // Arrange
            var command = new CreateInquiryCommand
            {
                BuyerId = Guid.NewGuid(),
                PropertyId = Guid.NewGuid(),
                Message = "Hello, I am interested in this property."
            };

            var handler = new CreateInquiryCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeEmpty();
            var saved = await _context.PropertyInquiries.FindAsync(result);
            saved.Should().NotBeNull();
            saved!.Message.Should().Be(command.Message);
            saved.BuyerId.Should().Be(command.BuyerId);
            saved.Status.Should().Be("Submitted");
        }

        [Fact]
        public async Task GetInquiryHistory_ShouldReturnUserInquiries()
        {
            // Arrange
            var buyerId = Guid.NewGuid();
            _context.PropertyInquiries.AddRange(
                new PropertyInquiry { BuyerId = buyerId, PropertyId = Guid.NewGuid(), Message = "Inquiry 1", Status = "Submitted" },
                new PropertyInquiry { BuyerId = buyerId, PropertyId = Guid.NewGuid(), Message = "Inquiry 2", Status = "Read" },
                new PropertyInquiry { BuyerId = Guid.NewGuid(), PropertyId = Guid.NewGuid(), Message = "Other Inquiry", Status = "Submitted" }
            );
            await _context.SaveChangesAsync();

            var query = new GetInquiryHistoryQuery { BuyerId = buyerId };
            var handler = new GetInquiryHistoryQueryHandler(_context);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            result.Should().HaveCount(2);
            result.Should().Contain(i => i.Message == "Inquiry 1");
            result.Should().Contain(i => i.Message == "Inquiry 2");
        }

        [Fact]
        public async Task UpdateInquiryStatus_ValidCommand_ShouldUpdateStatus()
        {
            // Arrange
            var inquiry = new PropertyInquiry
            {
                BuyerId = Guid.NewGuid(),
                PropertyId = Guid.NewGuid(),
                Message = "Interested",
                Status = "Submitted"
            };
            _context.PropertyInquiries.Add(inquiry);
            await _context.SaveChangesAsync();

            var command = new UpdateInquiryStatusCommand
            {
                InquiryId = inquiry.Id,
                Status = "Read"
            };
            var handler = new UpdateInquiryStatusCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            var updated = await _context.PropertyInquiries.FindAsync(inquiry.Id);
            updated!.Status.Should().Be("Read");
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
