using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Users.Commands.UpdateProfile;
using RealEstate.Application.Users.Queries.GetProfile;
using RealEstate.Application.Favorites.Commands.AddToFavorites;
using RealEstate.Application.Favorites.Commands.RemoveFromFavorites;
using RealEstate.Application.Favorites.Queries.GetFavorites;
using RealEstate.Application.History.Commands.AddRecentlyViewed;
using RealEstate.Application.History.Queries.GetRecentlyViewed;
using System.Collections.Generic;

namespace RealEstate.API.Controllers
{
    [Authorize]
    public class UserController : ApiControllerBase
    {
        [HttpGet("profile")]
        public async Task<ActionResult<UserProfileDto>> GetProfile()
        {
            var profile = await Mediator.Send(new GetUserProfileQuery { UserId = CurrentUserId });
            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(UpdateUserProfileCommand command)
        {
            if (command.UserId != CurrentUserId)
            {
                return BadRequest("User ID mismatch.");
            }

            var success = await Mediator.Send(command);
            return Ok(new { Success = success, Message = "Profile updated successfully." });
        }

        [HttpGet("favorites")]
        public async Task<ActionResult<List<Guid>>> GetFavorites()
        {
            var favorites = await Mediator.Send(new GetFavoritesQuery { UserId = CurrentUserId });
            return Ok(favorites);
        }

        [HttpPost("favorites")]
        public async Task<IActionResult> AddToFavorites([FromBody] Guid propertyId)
        {
            var success = await Mediator.Send(new AddToFavoritesCommand { UserId = CurrentUserId, PropertyId = propertyId });
            return Ok(new { Success = success, Message = "Listing added to favorites." });
        }

        [HttpDelete("favorites/{propertyId}")]
        public async Task<IActionResult> RemoveFromFavorites(Guid propertyId)
        {
            var success = await Mediator.Send(new RemoveFromFavoritesCommand { UserId = CurrentUserId, PropertyId = propertyId });
            return Ok(new { Success = success, Message = "Listing removed from favorites." });
        }

        [HttpGet("recently-viewed")]
        public async Task<ActionResult<List<Guid>>> GetRecentlyViewed()
        {
            var history = await Mediator.Send(new GetRecentlyViewedQuery { UserId = CurrentUserId });
            return Ok(history);
        }

        [HttpPost("recently-viewed")]
        public async Task<IActionResult> AddToRecentlyViewed([FromBody] Guid propertyId)
        {
            var success = await Mediator.Send(new AddRecentlyViewedCommand { UserId = CurrentUserId, PropertyId = propertyId });
            return Ok(new { Success = success, Message = "View tracked successfully." });
        }
    }
}
