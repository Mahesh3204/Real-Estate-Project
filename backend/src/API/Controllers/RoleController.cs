using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Roles.Commands;
using RealEstate.Application.Roles.Queries;
using RealEstate.API.Middleware;

namespace RealEstate.API.Controllers
{
    [Route("api/v1/admin/roles")]
    public class RoleController : ApiControllerBase
    {
        [HttpGet]
        [AuthorizePermission("role.read")]
        public async Task<ActionResult<PaginatedList<RoleDto>>> GetRoles([FromQuery] GetRolesQuery query)
        {
            var result = await Mediator.Send(query);
            return Ok(new
            {
                Success = true,
                Message = "Roles retrieved successfully.",
                Data = result.Items,
                Meta = new
                {
                    result.PageNumber,
                    result.PageSize,
                    result.TotalRecords,
                    result.TotalPages
                }
            });
        }

        [HttpGet("{id}")]
        [AuthorizePermission("role.read")]
        public async Task<ActionResult<RoleDetailsDto>> GetRole(Guid id)
        {
            var result = await Mediator.Send(new GetRoleByIdQuery { Id = id });
            return Ok(new
            {
                Success = true,
                Message = "Role retrieved successfully.",
                Data = result
            });
        }

        [HttpPost]
        [AuthorizePermission("role.create")]
        public async Task<IActionResult> Create(CreateRoleCommand command)
        {
            var roleId = await Mediator.Send(command);
            return CreatedAtAction(nameof(GetRole), new { id = roleId }, new
            {
                Success = true,
                Message = "Role created successfully.",
                Data = new { Id = roleId, command.Name }
            });
        }

        [HttpPut("{id}")]
        [AuthorizePermission("role.update")]
        public async Task<IActionResult> Update(Guid id, UpdateRoleCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest(new { Success = false, Message = "Role ID mismatch." });
            }

            await Mediator.Send(command);
            return Ok(new
            {
                Success = true,
                Message = "Role updated successfully.",
                Data = new { Id = id, command.Name }
            });
        }

        [HttpDelete("{id}")]
        [AuthorizePermission("role.delete")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await Mediator.Send(new DeleteRoleCommand { Id = id });
            return Ok(new
            {
                Success = true,
                Message = "Role deleted successfully."
            });
        }

        [HttpPost("{id}/permissions")]
        [AuthorizePermission("role.update")]
        public async Task<IActionResult> AssignPermissions(Guid id, [FromBody] AssignPermissionsCommand command)
        {
            if (id != command.RoleId)
            {
                return BadRequest(new { Success = false, Message = "Role ID mismatch." });
            }

            await Mediator.Send(command);
            return Ok(new
            {
                Success = true,
                Message = "Permissions assigned to role successfully."
            });
        }

        [HttpDelete("{id}/permissions")]
        [AuthorizePermission("role.update")]
        public async Task<IActionResult> RemovePermissions(Guid id, [FromBody] RemovePermissionsCommand command)
        {
            if (id != command.RoleId)
            {
                return BadRequest(new { Success = false, Message = "Role ID mismatch." });
            }

            await Mediator.Send(command);
            return Ok(new
            {
                Success = true,
                Message = "Permissions removed from role successfully."
            });
        }
    }
}
