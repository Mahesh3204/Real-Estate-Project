using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Reviews.Commands.SubmitReview;

namespace RealEstate.Application.Reviews.Queries.GetReviews
{
    public class ReviewSummaryDto
    {
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public Dictionary<int, int> Distribution { get; set; } = new();
        public List<ReviewDto> Reviews { get; set; } = new();
    }

    public class GetReviewsQuery : IRequest<ReviewSummaryDto>
    {
        public Guid? SellerId { get; set; }
        public Guid? PropertyId { get; set; }
    }

    public class GetReviewsQueryHandler : IRequestHandler<GetReviewsQuery, ReviewSummaryDto>
    {
        private readonly IApplicationDbContext _context;

        public GetReviewsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ReviewSummaryDto> Handle(GetReviewsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Reviews.AsQueryable();

            if (request.SellerId.HasValue)
                query = query.Where(r => r.SellerId == request.SellerId.Value);

            if (request.PropertyId.HasValue)
                query = query.Where(r => r.PropertyId == request.PropertyId.Value);

            query = query.Where(r => !r.IsHidden);

            var reviews = await query
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync(cancellationToken);

            if (!reviews.Any())
            {
                return new ReviewSummaryDto
                {
                    AverageRating = 0,
                    TotalReviews = 0,
                    Distribution = new Dictionary<int, int> { { 1, 0 }, { 2, 0 }, { 3, 0 }, { 4, 0 }, { 5, 0 } },
                    Reviews = new List<ReviewDto>()
                };
            }

            var buyerIds = reviews.Select(r => r.BuyerId).Distinct().ToList();
            var buyers = await _context.Users
                .Where(u => buyerIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => $"{u.FirstName} {u.LastName}".Trim(), cancellationToken);

            var dtos = reviews.Select(r =>
            {
                List<string>? images = null;
                if (!string.IsNullOrEmpty(r.Images))
                {
                    try { images = JsonSerializer.Deserialize<List<string>>(r.Images); } catch { /* noop */ }
                }
                return new ReviewDto
                {
                    Id = r.Id,
                    PropertyId = r.PropertyId,
                    SellerId = r.SellerId,
                    BuyerId = r.BuyerId,
                    BuyerName = buyers.TryGetValue(r.BuyerId, out var name) ? name : null,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    ImageUrls = images,
                    ReplyMessage = r.ReplyContent,
                    IsReported = r.IsReported,
                    CreatedAt = r.CreatedAt,
                };
            }).ToList();

            var avg = reviews.Average(r => r.Rating);
            var distribution = new Dictionary<int, int> { { 1, 0 }, { 2, 0 }, { 3, 0 }, { 4, 0 }, { 5, 0 } };
            foreach (var r in reviews)
            {
                if (distribution.ContainsKey(r.Rating)) distribution[r.Rating]++;
            }

            return new ReviewSummaryDto
            {
                AverageRating = Math.Round(avg, 1),
                TotalReviews = reviews.Count,
                Distribution = distribution,
                Reviews = dtos,
            };
        }
    }
}
