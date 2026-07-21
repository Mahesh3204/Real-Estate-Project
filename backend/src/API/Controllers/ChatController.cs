using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Chat.Commands.GetOrCreateConversation;
using RealEstate.Application.Chat.Commands.MarkConversationAsRead;
using RealEstate.Application.Chat.Commands.SendMessage;
using RealEstate.Application.Chat.Queries.GetConversations;
using RealEstate.Application.Chat.Queries.GetMessages;

namespace RealEstate.API.Controllers
{
    [Authorize]
    [Route("api/chat")]
    public class ChatController : ApiControllerBase
    {
        [HttpGet("conversations")]
        public async Task<ActionResult<List<ConversationDto>>> GetConversations([FromQuery] string? searchTerm = null)
        {
            var conversations = await Mediator.Send(new GetConversationsQuery
            {
                UserId = CurrentUserId,
                SearchTerm = searchTerm
            });
            return Ok(conversations);
        }

        [HttpGet("conversations/{conversationId}/messages")]
        public async Task<ActionResult<List<MessageDto>>> GetMessages(Guid conversationId)
        {
            var messages = await Mediator.Send(new GetMessagesQuery
            {
                ConversationId = conversationId,
                UserId = CurrentUserId
            });
            return Ok(messages);
        }

        [HttpPost("conversations")]
        public async Task<ActionResult<Guid>> GetOrCreateConversation([FromBody] GetOrCreateConversationRequest request)
        {
            var id = await Mediator.Send(new GetOrCreateConversationCommand
            {
                PropertyId = request.PropertyId,
                BuyerId = CurrentUserId
            });
            return Ok(id);
        }

        [HttpPost("conversations/{conversationId}/messages")]
        public async Task<ActionResult<Guid>> SendMessage(Guid conversationId, [FromBody] SendMessageRequest request)
        {
            var id = await Mediator.Send(new SendMessageCommand
            {
                ConversationId = conversationId,
                SenderId = CurrentUserId,
                Content = request.Content,
                ContentType = request.ContentType
            });
            return Ok(id);
        }

        [HttpPost("conversations/{conversationId}/read")]
        public async Task<IActionResult> MarkAsRead(Guid conversationId)
        {
            var success = await Mediator.Send(new MarkConversationAsReadCommand
            {
                ConversationId = conversationId,
                UserId = CurrentUserId
            });
            return Ok(new { Success = success });
        }
    }

    public class GetOrCreateConversationRequest
    {
        public Guid PropertyId { get; set; }
    }

    public class SendMessageRequest
    {
        public string Content { get; set; } = string.Empty;
        public RealEstate.Domain.Enums.MessageContentType ContentType { get; set; } = RealEstate.Domain.Enums.MessageContentType.Text;
    }
}
