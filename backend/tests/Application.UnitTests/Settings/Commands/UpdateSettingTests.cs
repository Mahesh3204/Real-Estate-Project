using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Settings.Commands;
using RealEstate.Infrastructure.Data;
using Xunit;

namespace RealEstate.Application.UnitTests.Settings.Commands
{
    public class UpdateSettingTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly UpdateSettingCommandHandler _handler;

        public UpdateSettingTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var currentUserService = Substitute.For<ICurrentUserService>();
            currentUserService.UserId.Returns(Guid.NewGuid());

            _context = new ApplicationDbContext(options, currentUserService);
            _handler = new UpdateSettingCommandHandler(_context);
        }

        [Fact]
        public async Task Handle_NewSetting_ShouldInsertIntoDatabase()
        {
            var command = new UpdateSettingCommand
            {
                Key = "TestKey",
                Value = "TestValue"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            var setting = await _context.SystemSettings.FindAsync("TestKey");
            setting.Should().NotBeNull();
            setting!.Value.Should().Be("TestValue");
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
