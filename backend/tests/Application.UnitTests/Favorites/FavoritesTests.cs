using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Favorites.Commands.AddToFavorites;
using RealEstate.Application.Favorites.Commands.RemoveFromFavorites;
using RealEstate.Application.Favorites.Queries.GetFavorites;
using RealEstate.Domain.Entities;
using RealEstate.Infrastructure.Data;
using Xunit;

namespace RealEstate.Application.UnitTests.Favorites
{
    public class FavoritesTests : IDisposable
    {
        private readonly ApplicationDbContext _context;

        public FavoritesTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
        }

        [Fact]
        public async Task AddToFavorites_ValidCommand_ShouldSaveFavoriteLink()
        {
            // Arrange
            var command = new AddToFavoritesCommand
            {
                UserId = Guid.NewGuid(),
                PropertyId = Guid.NewGuid()
            };
            var handler = new AddToFavoritesCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            var favorite = await _context.PropertyFavorites.FirstOrDefaultAsync(f => f.UserId == command.UserId && f.PropertyId == command.PropertyId);
            favorite.Should().NotBeNull();
        }

        [Fact]
        public async Task RemoveFromFavorites_ValidCommand_ShouldDeleteFavoriteLink()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var propertyId = Guid.NewGuid();
            var favorite = new PropertyFavorite { UserId = userId, PropertyId = propertyId };
            _context.PropertyFavorites.Add(favorite);
            await _context.SaveChangesAsync();

            var command = new RemoveFromFavoritesCommand
            {
                UserId = userId,
                PropertyId = propertyId
            };
            var handler = new RemoveFromFavoritesCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            var exists = await _context.PropertyFavorites.AnyAsync(f => f.UserId == userId && f.PropertyId == propertyId);
            exists.Should().BeFalse();
        }

        [Fact]
        public async Task GetFavorites_ShouldReturnUserFavorites()
        {
            // Arrange
            var userId = Guid.NewGuid();
            _context.PropertyFavorites.AddRange(
                new PropertyFavorite { UserId = userId, PropertyId = Guid.NewGuid() },
                new PropertyFavorite { UserId = userId, PropertyId = Guid.NewGuid() },
                new PropertyFavorite { UserId = Guid.NewGuid(), PropertyId = Guid.NewGuid() }
            );
            await _context.SaveChangesAsync();

            var query = new GetFavoritesQuery { UserId = userId };
            var handler = new GetFavoritesQueryHandler(_context);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            result.Should().HaveCount(2);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
