using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Reviews.Commands.ReportReview
{
    public class ReportReviewCommand : IRequest<bool>
    {
        public Guid ReviewId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class ReportReviewCommandHandler : IRequestHandler<ReportReviewCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public ReportReviewCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(ReportReviewCommand request, CancellationToken cancellationToken)
        {
            var review = await _context.Reviews.FindAsync(new object[] { request.ReviewId }, cancellationToken);
            if (review == null)
                throw new InvalidOperationException("Review not found.");

            review.IsReported = true;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
