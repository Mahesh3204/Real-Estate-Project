using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using NSubstitute;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.History.Commands.AddRecentlyViewed;
using RealEstate.Application.History.Queries.GetRecentlyViewed;
using Xunit;

namespace RealEstate.Application.UnitTests.History
{
    public class RecentlyViewedTests
    {
        private readonly IRecentlyViewedService _service;
        private readonly AddRecentlyViewedCommandHandler _addHandler;
        private readonly GetRecentlyViewedQueryHandler _getQueryHandler;

        public RecentlyViewedTests()
        {
            _service = Substitute.For<IRecentlyViewedService>();
            _addHandler = new AddRecentlyViewedCommandHandler(_service);
            _getQueryHandler = new GetRecentlyViewedQueryHandler(_service);
        }

        [Fact]
        public async Task AddRecentlyViewed_ShouldCallService()
        {
            // Arrange
            var command = new AddRecentlyViewedCommand
            {
                UserId = Guid.NewGuid(),
                PropertyId = Guid.NewGuid()
            };

            // Act
            var result = await _addHandler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            await _service.Received(1).AddToHistoryAsync(command.UserId, command.PropertyId);
        }

        [Fact]
        public async Task GetRecentlyViewed_ShouldReturnListFromService()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var mockedHistory = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };
            _service.GetHistoryAsync(userId).Returns(mockedHistory);

            var query = new GetRecentlyViewedQuery { UserId = userId };

            // Act
            var result = await _getQueryHandler.Handle(query, CancellationToken.None);

            // Assert
            result.Should().BeEquivalentTo(mockedHistory);
            await _service.Received(1).GetHistoryAsync(userId);
        }
    }
}
