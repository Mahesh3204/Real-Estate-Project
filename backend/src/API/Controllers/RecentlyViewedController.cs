using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.History.Commands.AddRecentlyViewed;
using RealEstate.Application.History.Commands.ClearRecentlyViewed;
using RealEstate.Application.History.Queries.GetRecentlyViewed;

namespace RealEstate.API.Controllers
{
    [Authorize]
    [Route("api/v1/recently-viewed")]
    public class RecentlyViewedController : ApiControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetRecentlyViewed([FromQuery] int count = 10)
        {
            var result = await Mediator.Send(new GetRecentlyViewedPropertiesQuery 
            { 
                UserId = CurrentUserId, 
                Count = count 
            });
            return Ok(new { Success = true, Data = result });
        }

        [HttpPost]
        public async Task<IActionResult> AddRecentlyViewed([FromBody] AddRequest request)
        {
            if (request == null || request.PropertyId == Guid.Empty)
            {
                return BadRequest("Invalid property id.");
            }

            var result = await Mediator.Send(new AddRecentlyViewedCommand 
            { 
                UserId = CurrentUserId, 
                PropertyId = request.PropertyId 
            });
            return Ok(new { Success = result });
        }

        [HttpDelete]
        public async Task<IActionResult> ClearRecentlyViewed()
        {
            var result = await Mediator.Send(new ClearRecentlyViewedCommand 
            { 
                UserId = CurrentUserId 
            });
            return Ok(new { Success = result, Message = "Viewing history cleared successfully." });
        }

        public class AddRequest
        {
            public Guid PropertyId { get; set; }
        }
    }
}
