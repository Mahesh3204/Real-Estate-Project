using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Roles.Commands;
using RealEstate.Application.Roles.Queries;
using RealEstate.Domain.Entities;
using Microsoft.AspNetCore.Identity;
namespace RealEstate.API.Controllers
{
    [Authorize]
    [Route("api/v1/roles")]
    public class UserRolesController : ApiControllerBase
    {
        private readonly IApplicationDbContext _context;

        public UserRolesController(IApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("requests")]
        public async Task<IActionResult> GetRoleRequests([FromQuery] GetRoleRequestsQuery query)
        {
            var result = await Mediator.Send(query);
            return Ok(new
            {
                Success = true,
                Data = result
            });
        }

        [HttpPost("requests")]
        public async Task<IActionResult> CreateRequest([FromBody] CreateRoleRequestCommand command)
        {
            var requestId = await Mediator.Send(command);

            // Fetch request status to comply with api.md contract
            var request = await _context.RoleRequests
                .Include(r => r.RequestedRole)
                .FirstOrDefaultAsync(r => r.Id == requestId);

            if (request == null)
            {
                return BadRequest("Failed to process request.");
            }

            var responseData = new
            {
                RequestId = request.Id,
                Status = request.Status.ToString(),
                Message = request.Status == RealEstate.Domain.Enums.RoleRequestStatus.Approved
                    ? "Role upgraded successfully."
                    : "Your request has been submitted for approval."
            };

            if (request.Status == RealEstate.Domain.Enums.RoleRequestStatus.Approved)
            {
                return Ok(new { Success = true, Data = responseData });
            }

            return StatusCode(201, new { Success = true, Data = responseData });
        }

        [HttpPost("requests/{id}/cancel")]
        public async Task<IActionResult> CancelRequest(Guid id)
        {
            var result = await Mediator.Send(new CancelRoleRequestCommand { RequestId = id });
            return Ok(new
            {
                Success = result,
                Message = "Request cancelled successfully."
            });
        }

        [HttpPost("switch-active")]
        public async Task<IActionResult> SwitchActiveRole([FromBody] SwitchActiveRoleCommand command)
        {
            var activeRole = await Mediator.Send(command);

            var currentUserService = HttpContext.RequestServices.GetService(typeof(ICurrentUserService)) as ICurrentUserService;
            var userManager = HttpContext.RequestServices.GetService(typeof(UserManager<User>)) as UserManager<User>;
            var tokenGenerator = HttpContext.RequestServices.GetService(typeof(IJwtTokenGenerator)) as IJwtTokenGenerator;

            var userId = currentUserService?.UserId;
            var newToken = string.Empty;

            if (userId.HasValue && userManager != null && tokenGenerator != null)
            {
                var user = await userManager.FindByIdAsync(userId.Value.ToString());
                if (user != null)
                {
                    newToken = tokenGenerator.GenerateToken(user);
                }
            }

            return Ok(new
            {
                Success = true,
                Data = new { ActiveRole = activeRole, Token = newToken }
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("requests/{id}/approve")]
        public async Task<IActionResult> ApproveRequest(Guid id, [FromBody] ReviewRequestModel model)
        {
            await Mediator.Send(new ApproveRoleRequestCommand { RequestId = id, Notes = model.Notes });
            return Ok(new
            {
                Success = true,
                Message = "Upgrade request approved successfully."
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("requests/{id}/reject")]
        public async Task<IActionResult> RejectRequest(Guid id, [FromBody] ReviewRequestModel model)
        {
            await Mediator.Send(new RejectRoleRequestCommand { RequestId = id, Notes = model.Notes });
            return Ok(new
            {
                Success = true,
                Message = "Upgrade request rejected."
            });
        }
    }

    public class ReviewRequestModel
    {
        public string Notes { get; set; } = string.Empty;
    }
}
