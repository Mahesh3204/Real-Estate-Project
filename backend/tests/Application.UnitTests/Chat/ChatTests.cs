using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using RealEstate.Application.Chat.Commands.GetOrCreateConversation;
using RealEstate.Application.Chat.Commands.SendMessage;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using RealEstate.Infrastructure.Data;
using Xunit;

namespace RealEstate.Application.UnitTests.Chat
{
    public class ChatTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly IChatNotificationService _chatNotificationService;

        public ChatTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options, Substitute.For<ICurrentUserService>());
            _chatNotificationService = Substitute.For<IChatNotificationService>();
        }

        [Fact]
        public async Task GetOrCreateConversation_ShouldCreateNewConversation()
        {
            // Arrange
            var propertyId = Guid.NewGuid();
            var buyerId = Guid.NewGuid();
            var sellerId = Guid.NewGuid();

            // Seed property
            var property = new Property
            {
                Id = propertyId,
                OwnerId = sellerId,
                Title = "Test Property",
                Price = 100000
            };
            _context.Properties.Add(property);
            await _context.SaveChangesAsync();

            var command = new GetOrCreateConversationCommand
            {
                PropertyId = propertyId,
                BuyerId = buyerId
            };
            var handler = new GetOrCreateConversationCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeEmpty();
            var conversation = await _context.Conversations.FindAsync(result);
            conversation.Should().NotBeNull();
            conversation!.PropertyId.Should().Be(propertyId);
            conversation.BuyerId.Should().Be(buyerId);
            conversation.SellerId.Should().Be(sellerId);
        }

        [Fact]
        public async Task SendMessage_ValidCommand_ShouldSaveAndBroadcastMessage()
        {
            // Arrange
            var conversationId = Guid.NewGuid();
            var senderId = Guid.NewGuid();
            var receiverId = Guid.NewGuid();

            var conversation = new Conversation
            {
                Id = conversationId,
                PropertyId = Guid.NewGuid(),
                BuyerId = senderId,
                SellerId = receiverId
            };
            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();

            var command = new SendMessageCommand
            {
                ConversationId = conversationId,
                SenderId = senderId,
                Content = "Hello",
                ContentType = MessageContentType.Text
            };
            var handler = new SendMessageCommandHandler(_context, _chatNotificationService);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeEmpty();
            var saved = await _context.Messages.FindAsync(result);
            saved.Should().NotBeNull();
            saved!.Content.Should().Be(command.Content);

            await _chatNotificationService.Received(1).SendMessageAsync(
                conversationId,
                Arg.Any<Guid>(),
                senderId,
                Arg.Any<string>(),
                command.Content,
                (int)command.ContentType,
                Arg.Any<DateTime>());
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
