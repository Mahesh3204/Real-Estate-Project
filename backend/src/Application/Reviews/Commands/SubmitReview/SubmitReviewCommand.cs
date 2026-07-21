using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Reviews.Commands.SubmitReview
{
    public class SubmitReviewCommand : IRequest<ReviewDto>
    {
        public Guid PropertyId { get; set; }
        public Guid SellerId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public List<string>? ImageUrls { get; set; }
        public Guid BuyerId { get; set; }
    }

    public class ReviewDto
    {
        public Guid Id { get; set; }
        public Guid PropertyId { get; set; }
        public Guid SellerId { get; set; }
        public Guid BuyerId { get; set; }
        public string? BuyerName { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public List<string>? ImageUrls { get; set; }
        public string? ReplyMessage { get; set; }
        public DateTime? ReplyAt { get; set; }
        public bool IsReported { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class SubmitReviewCommandValidator : AbstractValidator<SubmitReviewCommand>
    {
        public SubmitReviewCommandValidator()
        {
            RuleFor(x => x.PropertyId).NotEmpty();
            RuleFor(x => x.SellerId).NotEmpty();
            RuleFor(x => x.BuyerId).NotEmpty();
            RuleFor(x => x.Rating).InclusiveBetween(1, 5);
            RuleFor(x => x.Comment).NotEmpty().MinimumLength(10);
        }
    }

    public class SubmitReviewCommandHandler : IRequestHandler<SubmitReviewCommand, ReviewDto>
    {
        private readonly IApplicationDbContext _context;

        public SubmitReviewCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ReviewDto> Handle(SubmitReviewCommand request, CancellationToken cancellationToken)
        {
            // Check if buyer has a completed appointment for this property
            var hasCompletedVisit = await _context.Appointments
                .AnyAsync(a => a.BuyerId == request.BuyerId && a.PropertyId == request.PropertyId && a.Status == Domain.Enums.AppointmentStatus.Completed, cancellationToken);

            if (!hasCompletedVisit)
                throw new InvalidOperationException("You must have completed a visit before leaving a review.");

            // Check for duplicate
            var existing = await _context.Reviews
                .AnyAsync(r => r.BuyerId == request.BuyerId && r.PropertyId == request.PropertyId, cancellationToken);

            if (existing)
                throw new InvalidOperationException("You have already reviewed this property.");

            var imageJson = request.ImageUrls != null ? JsonSerializer.Serialize(request.ImageUrls) : null;

            var review = new Review
            {
                PropertyId = request.PropertyId,
                SellerId = request.SellerId,
                BuyerId = request.BuyerId,
                Rating = request.Rating,
                Comment = request.Comment,
                Images = imageJson,
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync(cancellationToken);

            var buyer = await _context.Users.FindAsync(new object[] { request.BuyerId }, cancellationToken);

            return new ReviewDto
            {
                Id = review.Id,
                PropertyId = review.PropertyId,
                SellerId = review.SellerId,
                BuyerId = review.BuyerId,
                BuyerName = buyer != null ? $"{buyer.FirstName} {buyer.LastName}".Trim() : null,
                Rating = review.Rating,
                Comment = review.Comment,
                ImageUrls = request.ImageUrls,
                IsReported = review.IsReported,
                CreatedAt = review.CreatedAt,
            };
        }
    }
}
