using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Inquiries.Commands.CreateInquiry;
using RealEstate.Application.Inquiries.Commands.UpdateInquiryStatus;
using RealEstate.Application.Inquiries.Queries.GetInquiryHistory;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
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
                Subject = "Inquiry Subject",
                Message = "Hello, I am interested in this property.",
                Phone = "+1234567890",
                Email = "buyer@example.com",
                PreferredContactMethod = PreferredContactMethod.Email,
                PreferredContactTime = "Afternoons"
            };

            var handler = new CreateInquiryCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeEmpty();
            var saved = await _context.PropertyInquiries.FindAsync(result);
            saved.Should().NotBeNull();
            saved!.Subject.Should().Be(command.Subject);
            saved.Message.Should().Be(command.Message);
            saved.Phone.Should().Be(command.Phone);
            saved.Email.Should().Be(command.Email);
            saved.PreferredContactMethod.Should().Be(command.PreferredContactMethod);
            saved.PreferredContactTime.Should().Be(command.PreferredContactTime);
            saved.BuyerId.Should().Be(command.BuyerId);
            saved.Status.Should().Be(InquiryStatus.New);
        }

        [Fact]
        public async Task GetInquiryHistory_ShouldReturnUserInquiries()
        {
            // Arrange
            var buyerId = Guid.NewGuid();
            _context.PropertyInquiries.AddRange(
                new PropertyInquiry { BuyerId = buyerId, PropertyId = Guid.NewGuid(), Subject = "S1", Message = "Inquiry 1", Status = InquiryStatus.New, Phone = "123", Email = "a@a.com" },
                new PropertyInquiry { BuyerId = buyerId, PropertyId = Guid.NewGuid(), Subject = "S2", Message = "Inquiry 2", Status = InquiryStatus.Read, Phone = "123", Email = "a@a.com" },
                new PropertyInquiry { BuyerId = Guid.NewGuid(), PropertyId = Guid.NewGuid(), Subject = "S3", Message = "Other Inquiry", Status = InquiryStatus.New, Phone = "123", Email = "a@a.com" }
            );
            await _context.SaveChangesAsync();

            var query = new GetInquiryHistoryQuery { BuyerId = buyerId };
            var handler = new GetInquiryHistoryQueryHandler(_context);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            result.Should().HaveCount(2);
            result.Should().Contain(i => i.Message == "Inquiry 1" && i.Status == "New");
            result.Should().Contain(i => i.Message == "Inquiry 2" && i.Status == "Read");
        }

        [Fact]
        public async Task UpdateInquiryStatus_ValidCommand_ShouldUpdateStatus()
        {
            // Arrange
            var inquiry = new PropertyInquiry
            {
                BuyerId = Guid.NewGuid(),
                PropertyId = Guid.NewGuid(),
                Subject = "Inquiry Subject",
                Message = "Interested",
                Phone = "123",
                Email = "a@a.com",
                Status = InquiryStatus.New
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
            updated!.Status.Should().Be(InquiryStatus.Read);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
