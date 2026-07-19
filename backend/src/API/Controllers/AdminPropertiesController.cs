using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Properties.Commands;
using RealEstate.API.Middleware;

namespace RealEstate.API.Controllers
{
    [Route("api/v1/admin/properties")]
    [Authorize(Roles = "Admin")]
    public class AdminPropertiesController : ApiControllerBase
    {
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(Guid id)
        {
            var command = new AdminApprovePropertyCommand { Id = id, AdminUserId = CurrentUserId };
            var success = await Mediator.Send(command);
            return Ok(new { Success = success, Message = "Listing approved successfully." });
        }

        [HttpPost("{id}/reject")]
        public async Task<IActionResult> Reject(Guid id, [FromBody] RejectRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Reason))
            {
                return BadRequest("Rejection reason comments are required.");
            }

            var command = new AdminRejectPropertyCommand
            {
                Id = id,
                AdminUserId = CurrentUserId,
                Reason = request.Reason
            };
            var success = await Mediator.Send(command);
            return Ok(new { Success = success, Message = "Listing rejected. Owner has been notified." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> ForceDelete(Guid id)
        {
            var command = new AdminForceDeletePropertyCommand { Id = id };
            var success = await Mediator.Send(command);
            return Ok(new { Success = success, Message = "Listing permanently purged from the platform database." });
        }
    }

    public class RejectRequest
    {
        public string Reason { get; set; } = string.Empty;
    }
}
