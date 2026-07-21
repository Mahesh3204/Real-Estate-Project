using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Inquiries.Commands.CreateInquiry;
using RealEstate.Application.Inquiries.Commands.UpdateInquiryStatus;
using RealEstate.Application.Inquiries.Commands.ReplyToInquiry;
using RealEstate.Application.Inquiries.Commands.SoftDeleteInquiry;
using RealEstate.Application.Inquiries.Queries.GetInquiryHistory;

namespace RealEstate.API.Controllers
{
    [Authorize]
    [Route("api/user/inquiries")]
    public class InquiryController : ApiControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<InquiryDto>>> GetInquiries()
        {
            var inquiries = await Mediator.Send(new GetInquiryHistoryQuery { BuyerId = CurrentUserId });
            return Ok(inquiries);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateInquiry(CreateInquiryCommand command)
        {
            if (command.BuyerId != CurrentUserId)
            {
                return BadRequest("Buyer ID mismatch.");
            }

            var id = await Mediator.Send(command);
            return Ok(id);
        }

        [HttpPatch("{inquiryId}/status")]
        public async Task<IActionResult> UpdateInquiryStatus(Guid inquiryId, [FromBody] string status)
        {
            var success = await Mediator.Send(new UpdateInquiryStatusCommand
            {
                InquiryId = inquiryId,
                Status = status
            });
            return Ok(new { Success = success, Message = "Inquiry status updated." });
        }

        [HttpPost("{inquiryId}/reply")]
        public async Task<IActionResult> ReplyToInquiry(Guid inquiryId, [FromBody] ReplyToInquiryCommand command)
        {
            if (inquiryId != command.InquiryId)
            {
                return BadRequest("Inquiry ID mismatch.");
            }

            var success = await Mediator.Send(command);
            return Ok(new { Success = success, Message = "Reply posted successfully." });
        }

        [HttpDelete("{inquiryId}")]
        public async Task<IActionResult> SoftDeleteInquiry(Guid inquiryId)
        {
            var success = await Mediator.Send(new SoftDeleteInquiryCommand { InquiryId = inquiryId });
            return Ok(new { Success = success, Message = "Inquiry deleted successfully." });
        }
    }
}
