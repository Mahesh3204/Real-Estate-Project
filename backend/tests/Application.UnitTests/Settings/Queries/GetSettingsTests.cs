using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Settings.Queries;
using RealEstate.Infrastructure.Data;
using Xunit;

namespace RealEstate.Application.UnitTests.Settings.Queries
{
    public class GetSettingsTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly GetSettingsQueryHandler _handler;

        public GetSettingsTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var currentUserService = Substitute.For<ICurrentUserService>();
            currentUserService.UserId.Returns(Guid.NewGuid());

            _context = new ApplicationDbContext(options, currentUserService);
            _handler = new GetSettingsQueryHandler(_context);
        }

        [Fact]
        public async Task Handle_EmptyDatabase_ShouldSeedDefaultSettingAndReturn()
        {
            // Act
            var result = await _handler.Handle(new GetSettingsQuery(), CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.Should().ContainKey("AutoApproveRoleRequests");
            result["AutoApproveRoleRequests"].Should().Be("false");
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
