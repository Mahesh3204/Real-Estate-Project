using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Notifications.Commands.MarkNotificationAsRead;
using RealEstate.Application.Notifications.Queries.GetNotifications;

namespace RealEstate.API.Controllers
{
    [Authorize]
    [Route("api/notifications")]
    public class NotificationsController : ApiControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<NotificationDto>>> GetNotifications()
        {
            var notifications = await Mediator.Send(new GetNotificationsQuery { UserId = CurrentUserId });
            return Ok(notifications);
        }

        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var success = await Mediator.Send(new MarkNotificationAsReadCommand
            {
                NotificationId = id,
                UserId = CurrentUserId,
                MarkAll = false
            });
            return Ok(new { Success = success });
        }

        [HttpPost("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var success = await Mediator.Send(new MarkNotificationAsReadCommand
            {
                UserId = CurrentUserId,
                MarkAll = true
            });
            return Ok(new { Success = success });
        }
    }
}
