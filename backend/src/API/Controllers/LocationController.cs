using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Locations.Commands;
using RealEstate.Application.Locations.Queries;
using RealEstate.API.Middleware;

namespace RealEstate.API.Controllers
{
    [Route("api/v1/locations")]
    public class LocationController : ApiControllerBase
    {
        // --- Countries ---
        [HttpGet("countries")]
        [AllowAnonymous]
        public async Task<ActionResult<List<CountryDto>>> GetCountries([FromQuery] bool includeInactive = false, [FromQuery] bool includeDeleted = false)
        {
            var countries = await Mediator.Send(new GetCountriesQuery { IncludeInactive = includeInactive, IncludeDeleted = includeDeleted });
            return Ok(new { Success = true, Data = countries });
        }

        [HttpPost("countries")]
        [AuthorizePermission("location.create")]
        public async Task<IActionResult> CreateCountry(CreateCountryCommand command)
        {
            var id = await Mediator.Send(command);
            return Ok(new { Success = true, Data = new { Id = id } });
        }

        [HttpPut("countries/{id}")]
        [AuthorizePermission("location.update")]
        public async Task<IActionResult> UpdateCountry(Guid id, UpdateCountryCommand command)
        {
            if (id != command.Id) return BadRequest("ID mismatch.");
            await Mediator.Send(command);
            return Ok(new { Success = true, Message = "Country updated." });
        }

        [HttpDelete("countries/{id}")]
        [AuthorizePermission("location.delete")]
        public async Task<IActionResult> DeleteCountry(Guid id)
        {
            await Mediator.Send(new DeleteCountryCommand { Id = id });
            return Ok(new { Success = true, Message = "Country soft-deleted successfully." });
        }

        // --- States ---
        [HttpGet("states")]
        [AllowAnonymous]
        public async Task<ActionResult<List<StateDto>>> GetStates([FromQuery] Guid countryId, [FromQuery] bool includeInactive = false, [FromQuery] bool includeDeleted = false)
        {
            var states = await Mediator.Send(new GetStatesQuery { CountryId = countryId, IncludeInactive = includeInactive, IncludeDeleted = includeDeleted });
            return Ok(new { Success = true, Data = states });
        }

        [HttpPost("states")]
        [AuthorizePermission("location.create")]
        public async Task<IActionResult> CreateState(CreateStateCommand command)
        {
            var id = await Mediator.Send(command);
            return Ok(new { Success = true, Data = new { Id = id } });
        }

        [HttpPut("states/{id}")]
        [AuthorizePermission("location.update")]
        public async Task<IActionResult> UpdateState(Guid id, UpdateStateCommand command)
        {
            if (id != command.Id) return BadRequest("ID mismatch.");
            await Mediator.Send(command);
            return Ok(new { Success = true, Message = "State updated." });
        }

        [HttpDelete("states/{id}")]
        [AuthorizePermission("location.delete")]
        public async Task<IActionResult> DeleteState(Guid id)
        {
            await Mediator.Send(new DeleteStateCommand { Id = id });
            return Ok(new { Success = true, Message = "State soft-deleted successfully." });
        }

        // --- Cities ---
        [HttpGet("cities")]
        [AllowAnonymous]
        public async Task<ActionResult<List<CityDto>>> GetCities([FromQuery] Guid stateId, [FromQuery] bool includeInactive = false, [FromQuery] bool includeDeleted = false)
        {
            var cities = await Mediator.Send(new GetCitiesQuery { StateId = stateId, IncludeInactive = includeInactive, IncludeDeleted = includeDeleted });
            return Ok(new { Success = true, Data = cities });
        }

        [HttpPost("cities")]
        [AuthorizePermission("location.create")]
        public async Task<IActionResult> CreateCity(CreateCityCommand command)
        {
            var id = await Mediator.Send(command);
            return Ok(new { Success = true, Data = new { Id = id } });
        }

        [HttpPut("cities/{id}")]
        [AuthorizePermission("location.update")]
        public async Task<IActionResult> UpdateCity(Guid id, UpdateCityCommand command)
        {
            if (id != command.Id) return BadRequest("ID mismatch.");
            await Mediator.Send(command);
            return Ok(new { Success = true, Message = "City updated." });
        }

        [HttpDelete("cities/{id}")]
        [AuthorizePermission("location.delete")]
        public async Task<IActionResult> DeleteCity(Guid id)
        {
            await Mediator.Send(new DeleteCityCommand { Id = id });
            return Ok(new { Success = true, Message = "City soft-deleted successfully." });
        }

        // --- Areas ---
        [HttpGet("areas")]
        [AllowAnonymous]
        public async Task<ActionResult<List<AreaDto>>> GetAreas([FromQuery] Guid cityId, [FromQuery] bool includeInactive = false, [FromQuery] bool includeDeleted = false)
        {
            var areas = await Mediator.Send(new GetAreasQuery { CityId = cityId, IncludeInactive = includeInactive, IncludeDeleted = includeDeleted });
            return Ok(new { Success = true, Data = areas });
        }

        [HttpPost("areas")]
        [AuthorizePermission("location.create")]
        public async Task<IActionResult> CreateArea(CreateAreaCommand command)
        {
            var id = await Mediator.Send(command);
            return Ok(new { Success = true, Data = new { Id = id } });
        }

        [HttpPut("areas/{id}")]
        [AuthorizePermission("location.update")]
        public async Task<IActionResult> UpdateArea(Guid id, UpdateAreaCommand command)
        {
            if (id != command.Id) return BadRequest("ID mismatch.");
            await Mediator.Send(command);
            return Ok(new { Success = true, Message = "Area updated." });
        }

        [HttpDelete("areas/{id}")]
        [AuthorizePermission("location.delete")]
        public async Task<IActionResult> DeleteArea(Guid id)
        {
            await Mediator.Send(new DeleteAreaCommand { Id = id });
            return Ok(new { Success = true, Message = "Area soft-deleted successfully." });
        }
    }
}
