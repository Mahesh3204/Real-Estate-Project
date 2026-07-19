using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Permissions.Commands;
using RealEstate.Application.Permissions.Queries;
using RealEstate.Application.Roles.Queries;
using RealEstate.API.Middleware;

namespace RealEstate.API.Controllers
{
    [Route("api/v1/admin/permissions")]
    public class PermissionController : ApiControllerBase
    {
        [HttpGet]
        [AuthorizePermission("permission.read")]
        public async Task<ActionResult<PaginatedList<PermissionDto>>> GetPermissions([FromQuery] GetPermissionsQuery query)
        {
            var result = await Mediator.Send(query);
            return Ok(new
            {
                Success = true,
                Message = "Permissions retrieved successfully.",
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

        [HttpPost]
        [AuthorizePermission("permission.create")]
        public async Task<IActionResult> Create(CreatePermissionCommand command)
        {
            var permissionId = await Mediator.Send(command);
            return Ok(new
            {
                Success = true,
                Message = "Permission created successfully.",
                Data = new { Id = permissionId, command.Name, command.Description }
            });
        }

        [HttpPut("{id}")]
        [AuthorizePermission("permission.update")]
        public async Task<IActionResult> Update(Guid id, UpdatePermissionCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest(new { Success = false, Message = "Permission ID mismatch." });
            }

            await Mediator.Send(command);
            return Ok(new
            {
                Success = true,
                Message = "Permission updated successfully.",
                Data = new { Id = id, command.Name, command.Description }
            });
        }

        [HttpDelete("{id}")]
        [AuthorizePermission("permission.delete")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await Mediator.Send(new DeletePermissionCommand { Id = id });
            return Ok(new
            {
                Success = true,
                Message = "Permission deleted successfully."
            });
        }
    }
}
