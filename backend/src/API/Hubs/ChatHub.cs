using System;
using System.Security.Claims;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using RealEstate.Domain.Enums;

namespace RealEstate.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ISender _mediator;

        public ChatHub(ISender mediator)
        {
            _mediator = mediator;
        }

        private Guid CurrentUserId
        {
            get
            {
                var idString = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? Context.UserIdentifier;
                return Guid.TryParse(idString, out var parsedGuid) ? parsedGuid : Guid.Empty;
            }
        }

        public async Task JoinConversation(Guid conversationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, conversationId.ToString());
        }

        public async Task LeaveConversation(Guid conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId.ToString());
        }

        public async Task SendTypingState(Guid conversationId, bool isTyping)
        {
            var userId = CurrentUserId;
            if (userId != Guid.Empty)
            {
                await Clients.Group(conversationId.ToString()).SendAsync("UserTypingState", conversationId, userId, isTyping);
            }
        }
    }
}
