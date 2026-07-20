using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Favorites.Commands.AddToFavorites;
using RealEstate.Application.Favorites.Commands.RemoveFromFavorites;
using RealEstate.Application.Favorites.Queries.GetFavorites;

namespace RealEstate.API.Controllers
{
    [Authorize]
    [Route("api/v1/favorites")]
    public class FavoritesController : ApiControllerBase
    {
        private readonly IApplicationDbContext _context;

        public FavoritesController(IApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            var result = await Mediator.Send(new GetFavoritesPropertiesQuery { UserId = CurrentUserId });
            return Ok(new { Success = true, Data = result });
        }

        [HttpPost]
        public async Task<IActionResult> AddFavorite([FromBody] AddFavoriteRequest request)
        {
            if (request == null || request.PropertyId == Guid.Empty)
            {
                return BadRequest("Invalid property id.");
            }

            var result = await Mediator.Send(new AddToFavoritesCommand 
            { 
                UserId = CurrentUserId, 
                PropertyId = request.PropertyId 
            });
            return Ok(new { Success = result, Message = "Listing added to favorites." });
        }

        [HttpDelete("{propertyId}")]
        public async Task<IActionResult> RemoveFavorite(Guid propertyId)
        {
            var result = await Mediator.Send(new RemoveFromFavoritesCommand 
            { 
                UserId = CurrentUserId, 
                PropertyId = propertyId 
            });
            return Ok(new { Success = result, Message = "Listing removed from favorites." });
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetFavoriteCount()
        {
            var count = await _context.PropertyFavorites
                .AsNoTracking()
                .CountAsync(f => f.UserId == CurrentUserId);
            return Ok(new { Success = true, Data = count });
        }

        public class AddFavoriteRequest
        {
            public Guid PropertyId { get; set; }
        }
    }
}
