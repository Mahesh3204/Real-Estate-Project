using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Settings.Commands;
using RealEstate.Application.Settings.Queries;

namespace RealEstate.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/v1/admin/settings")]
    public class AdminSettingsController : ApiControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var result = await Mediator.Send(new GetSettingsQuery());
            return Ok(new
            {
                Success = true,
                Data = result
            });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateSetting([FromBody] UpdateSettingCommand command)
        {
            var result = await Mediator.Send(command);
            return Ok(new
            {
                Success = result,
                Message = "Setting updated successfully."
            });
        }
    }
}
