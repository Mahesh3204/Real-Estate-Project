using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.AuditLogs.Queries;
using RealEstate.Application.Roles.Queries;
using RealEstate.API.Middleware;

namespace RealEstate.API.Controllers
{
    [Route("api/v1/admin/audit-logs")]
    public class AuditLogController : ApiControllerBase
    {
        [HttpGet]
        [AuthorizePermission("audit-log.read")]
        public async Task<ActionResult<PaginatedList<AuditLogDto>>> GetAuditLogs([FromQuery] GetAuditLogsQuery query)
        {
            var result = await Mediator.Send(query);
            return Ok(new
            {
                Success = true,
                Message = "Audit logs retrieved successfully.",
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
    }
}
