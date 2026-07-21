using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Reviews.Commands.ReplyToReview
{
    public class ReplyToReviewCommand : IRequest<bool>
    {
        public Guid ReviewId { get; set; }
        public Guid SellerId { get; set; }
        public string ReplyMessage { get; set; } = string.Empty;
    }

    public class ReplyToReviewCommandHandler : IRequestHandler<ReplyToReviewCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public ReplyToReviewCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(ReplyToReviewCommand request, CancellationToken cancellationToken)
        {
            var review = await _context.Reviews.FindAsync(new object[] { request.ReviewId }, cancellationToken);
            if (review == null)
                throw new InvalidOperationException("Review not found.");

            if (review.SellerId != request.SellerId)
                throw new UnauthorizedAccessException("Not authorized to reply to this review.");

            review.ReplyContent = request.ReplyMessage;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
