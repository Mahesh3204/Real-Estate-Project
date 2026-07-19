using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.MasterData.Commands;
using RealEstate.Application.MasterData.Queries;
using RealEstate.API.Middleware;

namespace RealEstate.API.Controllers
{
    [Route("api/v1/master-data")]
    public class MasterDataController : ApiControllerBase
    {
        // --- Categories ---
        [HttpGet("categories")]
        [AllowAnonymous]
        public async Task<ActionResult<List<CategoryDto>>> GetCategories([FromQuery] bool includeInactive = false, [FromQuery] bool includeDeleted = false)
        {
            var categories = await Mediator.Send(new GetCategoriesQuery { IncludeInactive = includeInactive, IncludeDeleted = includeDeleted });
            return Ok(new { Success = true, Data = categories });
        }

        [HttpPost("categories")]
        [AuthorizePermission("category.create")]
        public async Task<IActionResult> CreateCategory(CreateCategoryCommand command)
        {
            var id = await Mediator.Send(command);
            return Ok(new { Success = true, Data = new { Id = id } });
        }

        [HttpPut("categories/{id}")]
        [AuthorizePermission("category.update")]
        public async Task<IActionResult> UpdateCategory(Guid id, UpdateCategoryCommand command)
        {
            if (id != command.Id) return BadRequest("ID mismatch.");
            await Mediator.Send(command);
            return Ok(new { Success = true, Message = "Category updated successfully." });
        }

        [HttpDelete("categories/{id}")]
        [AuthorizePermission("category.delete")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            await Mediator.Send(new DeleteCategoryCommand { Id = id });
            return Ok(new { Success = true, Message = "Category soft-deleted successfully." });
        }

        // --- Property Types ---
        [HttpGet("types")]
        [AllowAnonymous]
        public async Task<ActionResult<List<PropertyTypeDto>>> GetPropertyTypes([FromQuery] Guid? categoryId, [FromQuery] bool includeInactive = false)
        {
            var types = await Mediator.Send(new GetPropertyTypesQuery { CategoryId = categoryId, IncludeInactive = includeInactive });
            return Ok(new { Success = true, Data = types });
        }

        [HttpPost("types")]
        [AuthorizePermission("type.create")]
        public async Task<IActionResult> CreatePropertyType(CreatePropertyTypeCommand command)
        {
            var id = await Mediator.Send(command);
            return Ok(new { Success = true, Data = new { Id = id } });
        }

        [HttpPut("types/{id}")]
        [AuthorizePermission("type.update")]
        public async Task<IActionResult> UpdatePropertyType(Guid id, UpdatePropertyTypeCommand command)
        {
            if (id != command.Id) return BadRequest("ID mismatch.");
            await Mediator.Send(command);
            return Ok(new { Success = true, Message = "Property Type updated successfully." });
        }

        [HttpDelete("types/{id}")]
        [AuthorizePermission("type.delete")]
        public async Task<IActionResult> DeletePropertyType(Guid id)
        {
            await Mediator.Send(new DeletePropertyTypeCommand { Id = id });
            return Ok(new { Success = true, Message = "Property Type deleted successfully." });
        }

        // --- Statuses ---
        [HttpGet("statuses")]
        [AllowAnonymous]
        public async Task<ActionResult<List<StatusDto>>> GetStatuses([FromQuery] bool includeInactive = false)
        {
            var statuses = await Mediator.Send(new GetStatusesQuery { IncludeInactive = includeInactive });
            return Ok(new { Success = true, Data = statuses });
        }

        [HttpPost("statuses")]
        [AuthorizePermission("status.create")]
        public async Task<IActionResult> CreateStatus(CreateStatusCommand command)
        {
            var id = await Mediator.Send(command);
            return Ok(new { Success = true, Data = new { Id = id } });
        }

        [HttpPut("statuses/{id}")]
        [AuthorizePermission("status.update")]
        public async Task<IActionResult> UpdateStatus(Guid id, UpdateStatusCommand command)
        {
            if (id != command.Id) return BadRequest("ID mismatch.");
            await Mediator.Send(command);
            return Ok(new { Success = true, Message = "Status updated successfully." });
        }

        [HttpDelete("statuses/{id}")]
        [AuthorizePermission("status.delete")]
        public async Task<IActionResult> DeleteStatus(Guid id)
        {
            await Mediator.Send(new DeleteStatusCommand { Id = id });
            return Ok(new { Success = true, Message = "Status deleted successfully." });
        }

        // --- Conditions ---
        [HttpGet("conditions")]
        [AllowAnonymous]
        public async Task<ActionResult<List<ConditionDto>>> GetConditions()
        {
            var conditions = await Mediator.Send(new GetConditionsQuery());
            return Ok(new { Success = true, Data = conditions });
        }

        [HttpPost("conditions")]
        [AuthorizePermission("condition.create")]
        public async Task<IActionResult> CreateCondition(CreateConditionCommand command)
        {
            var id = await Mediator.Send(command);
            return Ok(new { Success = true, Data = new { Id = id } });
        }

        [HttpPut("conditions/{id}")]
        [AuthorizePermission("condition.update")]
        public async Task<IActionResult> UpdateCondition(Guid id, UpdateConditionCommand command)
        {
            if (id != command.Id) return BadRequest("ID mismatch.");
            await Mediator.Send(command);
            return Ok(new { Success = true, Message = "Condition updated successfully." });
        }

        [HttpDelete("conditions/{id}")]
        [AuthorizePermission("condition.delete")]
        public async Task<IActionResult> DeleteCondition(Guid id)
        {
            await Mediator.Send(new DeleteConditionCommand { Id = id });
            return Ok(new { Success = true, Message = "Condition deleted successfully." });
        }

        // --- Amenities ---
        [HttpGet("amenities")]
        [AllowAnonymous]
        public async Task<ActionResult<List<AmenityDto>>> GetAmenities([FromQuery] bool includeInactive = false, [FromQuery] bool includeDeleted = false)
        {
            var amenities = await Mediator.Send(new GetAmenitiesQuery { IncludeInactive = includeInactive, IncludeDeleted = includeDeleted });
            return Ok(new { Success = true, Data = amenities });
        }

        [HttpPost("amenities")]
        [AuthorizePermission("amenity.create")]
        public async Task<IActionResult> CreateAmenity(CreateAmenityCommand command)
        {
            var id = await Mediator.Send(command);
            return Ok(new { Success = true, Data = new { Id = id } });
        }

        [HttpPut("amenities/{id}")]
        [AuthorizePermission("amenity.update")]
        public async Task<IActionResult> UpdateAmenity(Guid id, UpdateAmenityCommand command)
        {
            if (id != command.Id) return BadRequest("ID mismatch.");
            await Mediator.Send(command);
            return Ok(new { Success = true, Message = "Amenity updated successfully." });
        }

        [HttpDelete("amenities/{id}")]
        [AuthorizePermission("amenity.delete")]
        public async Task<IActionResult> DeleteAmenity(Guid id)
        {
            await Mediator.Send(new DeleteAmenityCommand { Id = id });
            return Ok(new { Success = true, Message = "Amenity soft-deleted successfully." });
        }
    }
}
