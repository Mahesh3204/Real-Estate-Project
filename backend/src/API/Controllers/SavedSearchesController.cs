using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.SavedSearches.Commands.CreateSavedSearch;
using RealEstate.Application.SavedSearches.Commands.DeleteSavedSearch;
using RealEstate.Application.SavedSearches.Queries.GetSavedSearches;

namespace RealEstate.API.Controllers
{
    [Authorize]
    [Route("api/v1/saved-searches")]
    public class SavedSearchesController : ApiControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<SavedSearchDto>>> GetSavedSearches()
        {
            var result = await Mediator.Send(new GetSavedSearchesQuery { UserId = CurrentUserId });
            return Ok(new { Success = true, Data = result });
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateSavedSearch([FromBody] CreateSavedSearchRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.QueryParameters))
            {
                return BadRequest("Invalid saved search parameters.");
            }

            var result = await Mediator.Send(new CreateSavedSearchCommand
            {
                UserId = CurrentUserId,
                Name = request.Name,
                QueryParameters = request.QueryParameters
            });

            return Ok(new { Success = true, Data = result, Message = "Search query saved successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSavedSearch(Guid id)
        {
            var result = await Mediator.Send(new DeleteSavedSearchCommand
            {
                Id = id,
                UserId = CurrentUserId
            });

            if (!result)
            {
                return NotFound(new { Success = false, Message = "Saved search not found or unauthorized." });
            }

            return Ok(new { Success = true, Message = "Saved search deleted successfully." });
        }

        public class CreateSavedSearchRequest
        {
            public string Name { get; set; } = string.Empty;
            public string QueryParameters { get; set; } = string.Empty;
        }
    }
}
