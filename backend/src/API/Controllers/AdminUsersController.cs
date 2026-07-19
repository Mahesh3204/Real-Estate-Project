using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Admin.Users.Commands;
using RealEstate.Application.Admin.Users.Queries;

namespace RealEstate.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/v1/admin/users")]
    public class AdminUsersController : ApiControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] GetUsersQuery query)
        {
            var result = await Mediator.Send(query);
            return Ok(new
            {
                Success = true,
                Data = result
            });
        }

        [HttpPost("{userId}/roles")]
        public async Task<IActionResult> UpdateUserRoles(Guid userId, [FromBody] UpdateUserRolesModel model)
        {
            var result = await Mediator.Send(new UpdateUserRolesCommand { UserId = userId, Roles = model.Roles });
            return Ok(new
            {
                Success = result,
                Message = "User roles updated successfully."
            });
        }
    }

    public class UpdateUserRolesModel
    {
        public List<string> Roles { get; set; } = new();
    }
}
