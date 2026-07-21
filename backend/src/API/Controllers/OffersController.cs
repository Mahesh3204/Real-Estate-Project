using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Offers.Commands.CounterOffer;
using RealEstate.Application.Offers.Commands.SubmitOffer;
using RealEstate.Application.Offers.Commands.UpdateOfferStatus;
using RealEstate.Application.Offers.Queries.GetOffers;
using RealEstate.Domain.Enums;

namespace RealEstate.API.Controllers
{
    [Authorize]
    [Route("api/offers")]
    public class OffersController : ApiControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<OfferDto>>> GetOffers([FromQuery] Guid? propertyId = null, [FromQuery] OfferStatus? status = null)
        {
            var offers = await Mediator.Send(new GetOffersQuery
            {
                UserId = CurrentUserId,
                PropertyId = propertyId,
                Status = status
            });
            return Ok(offers);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> SubmitOffer(SubmitOfferCommand command)
        {
            if (command.BuyerId != CurrentUserId)
            {
                return BadRequest("Buyer ID mismatch.");
            }

            var id = await Mediator.Send(command);
            return Ok(id);
        }

        [HttpPost("counter")]
        public async Task<ActionResult<Guid>> CounterOffer(CounterOfferCommand command)
        {
            if (command.SenderId != CurrentUserId)
            {
                return BadRequest("Sender ID mismatch.");
            }

            var id = await Mediator.Send(command);
            return Ok(id);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOfferStatus(Guid id, UpdateOfferStatusCommand command)
        {
            if (id != command.OfferId)
            {
                return BadRequest("Offer ID mismatch.");
            }
            if (command.UserId != CurrentUserId)
            {
                return BadRequest("User ID mismatch.");
            }

            var success = await Mediator.Send(command);
            return Ok(new { Success = success, Message = "Offer status updated." });
        }
    }
}
