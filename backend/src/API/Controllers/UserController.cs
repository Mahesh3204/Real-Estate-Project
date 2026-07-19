using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Users.Commands.UpdateProfile;
using RealEstate.Application.Users.Queries.GetProfile;
using RealEstate.Application.Favorites.Commands.AddToFavorites;
using RealEstate.Application.Favorites.Commands.RemoveFromFavorites;
using RealEstate.Application.Favorites.Queries.GetFavorites;
using RealEstate.Application.History.Commands.AddRecentlyViewed;
using RealEstate.Application.History.Queries.GetRecentlyViewed;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.API.Controllers
{
    [Authorize]
    public class UserController : ApiControllerBase
    {
        private readonly IFileUploadService _fileUploadService;
        private readonly IApplicationDbContext _context;

        public UserController(IFileUploadService fileUploadService, IApplicationDbContext context)
        {
            _fileUploadService = fileUploadService;
            _context = context;
        }

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

        [HttpPost("profile/avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { Success = false, Message = "No file uploaded." });
            }

            var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.Id == CurrentUserId);
            if (profile == null)
            {
                profile = new Profile { Id = CurrentUserId };
                _context.Profiles.Add(profile);
            }

            try
            {
                using (var stream = file.OpenReadStream())
                {
                    string avatarUrl = await _fileUploadService.UploadFileAsync(stream, file.FileName, file.ContentType, "avatars");

                    // Delete old avatar file from disk if present
                    if (!string.IsNullOrEmpty(profile.AvatarUrl))
                    {
                        _fileUploadService.DeleteFile(profile.AvatarUrl);
                    }

                    profile.AvatarUrl = avatarUrl;
                    await _context.SaveChangesAsync();

                    return Ok(new
                    {
                        Success = true,
                        Message = "Avatar uploaded successfully.",
                        Data = new { avatarUrl }
                    });
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Success = false, Message = ex.Message });
            }
        }

        [HttpDelete("profile/avatar")]
        public async Task<IActionResult> RemoveAvatar()
        {
            var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.Id == CurrentUserId);
            if (profile == null || string.IsNullOrEmpty(profile.AvatarUrl))
            {
                return BadRequest(new { Success = false, Message = "No avatar to remove." });
            }

            _fileUploadService.DeleteFile(profile.AvatarUrl);
            profile.AvatarUrl = null;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Success = true,
                Message = "Avatar removed successfully."
            });
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
