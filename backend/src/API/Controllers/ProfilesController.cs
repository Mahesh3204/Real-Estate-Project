using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Users.Queries.GetPublicProfile;

namespace RealEstate.API.Controllers
{
    [AllowAnonymous]
    [Route("api/v1/profiles")]
    public class ProfilesController : ApiControllerBase
    {
        [HttpGet("{id}")]
        public async Task<ActionResult<PublicProfileDto>> GetPublicProfile(Guid id)
        {
            var result = await Mediator.Send(new GetPublicProfileQuery { UserId = id });
            
            if (result == null)
            {
                return NotFound(new { Success = false, Message = "Public profile not found." });
            }

            return Ok(new { Success = true, Data = result });
        }
    }
}
