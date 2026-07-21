using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Offers.Queries.GetOffers
{
    public class OfferDto
    {
        public Guid Id { get; set; }
        public Guid PropertyId { get; set; }
        public string PropertyTitle { get; set; } = string.Empty;
        public decimal PropertyPrice { get; set; }
        public Guid BuyerId { get; set; }
        public string BuyerName { get; set; } = string.Empty;
        public decimal OfferAmount { get; set; }
        public string? Message { get; set; }
        public DateTimeOffset ExpirationDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class GetOffersQuery : IRequest<List<OfferDto>>
    {
        public Guid UserId { get; set; }
        public Guid? PropertyId { get; set; }
        public OfferStatus? Status { get; set; }
    }

    public class GetOffersQueryHandler : IRequestHandler<GetOffersQuery, List<OfferDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetOffersQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<OfferDto>> Handle(GetOffersQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Offers
                .Include(o => o.Property)
                .Include(o => o.Buyer)
                .Where(o => o.BuyerId == request.UserId || o.Property!.OwnerId == request.UserId);

            if (request.PropertyId.HasValue)
            {
                query = query.Where(o => o.PropertyId == request.PropertyId.Value);
            }

            if (request.Status.HasValue)
            {
                query = query.Where(o => o.Status == request.Status.Value);
            }

            var offers = await query
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OfferDto
                {
                    Id = o.Id,
                    PropertyId = o.PropertyId,
                    PropertyTitle = o.Property != null ? o.Property.Title : string.Empty,
                    PropertyPrice = o.Property != null ? o.Property.Price : 0,
                    BuyerId = o.BuyerId,
                    BuyerName = o.Buyer != null ? $"{o.Buyer.FirstName} {o.Buyer.LastName}".Trim() : string.Empty,
                    OfferAmount = o.OfferAmount,
                    Message = o.Message,
                    ExpirationDate = o.ExpirationDate,
                    Status = o.Status.ToString(),
                    CreatedAt = o.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return offers;
        }
    }
}
