using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Reviews.Commands.ReplyToReview;
using RealEstate.Application.Reviews.Commands.ReportReview;
using RealEstate.Application.Reviews.Commands.SubmitReview;
using RealEstate.Application.Reviews.Queries.GetReviews;

namespace RealEstate.API.Controllers
{
    [Route("api/reviews")]
    public class ReviewsController : ApiControllerBase
    {
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<ReviewDto>> Submit([FromBody] SubmitReviewCommand command)
        {
            command.BuyerId = CurrentUserId;
            var result = await Mediator.Send(command);
            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<ReviewSummaryDto>> GetReviews([FromQuery] Guid? sellerId, [FromQuery] Guid? propertyId)
        {
            var result = await Mediator.Send(new GetReviewsQuery { SellerId = sellerId, PropertyId = propertyId });
            return Ok(result);
        }

        [Authorize]
        [HttpPost("{id}/reply")]
        public async Task<IActionResult> Reply(Guid id, [FromBody] ReplyRequest request)
        {
            await Mediator.Send(new ReplyToReviewCommand
            {
                ReviewId = id,
                SellerId = CurrentUserId,
                ReplyMessage = request.ReplyMessage
            });
            return Ok();
        }

        [Authorize]
        [HttpPost("{id}/report")]
        public async Task<IActionResult> Report(Guid id, [FromBody] ReportRequest request)
        {
            await Mediator.Send(new ReportReviewCommand { ReviewId = id, Reason = request.Reason });
            return Ok();
        }
    }

    public class ReplyRequest
    {
        public string ReplyMessage { get; set; } = string.Empty;
    }

    public class ReportRequest
    {
        public string Reason { get; set; } = string.Empty;
    }
}
