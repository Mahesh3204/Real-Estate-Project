using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Inquiries.Queries.GetInquiryHistory
{
    public class InquiryDto
    {
        public Guid Id { get; set; }
        public Guid BuyerId { get; set; }
        public Guid PropertyId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public PreferredContactMethod PreferredContactMethod { get; set; }
        public string PreferredContactTime { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime LastUpdatedAt { get; set; }
    }

    public class GetInquiryHistoryQuery : IRequest<List<InquiryDto>>
    {
        public Guid BuyerId { get; set; }
    }

    public class GetInquiryHistoryQueryHandler : IRequestHandler<GetInquiryHistoryQuery, List<InquiryDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetInquiryHistoryQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<InquiryDto>> Handle(GetInquiryHistoryQuery request, CancellationToken cancellationToken)
        {
            var inquiries = await _context.PropertyInquiries
                .Where(i => i.BuyerId == request.BuyerId && !i.IsDeleted)
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new InquiryDto
                {
                    Id = i.Id,
                    BuyerId = i.BuyerId,
                    PropertyId = i.PropertyId,
                    Subject = i.Subject,
                    Message = i.Message,
                    Phone = i.Phone,
                    Email = i.Email,
                    PreferredContactMethod = i.PreferredContactMethod,
                    PreferredContactTime = i.PreferredContactTime,
                    Status = i.Status.ToString(),
                    CreatedAt = i.CreatedAt,
                    LastUpdatedAt = i.LastUpdatedAt
                })
                .ToListAsync(cancellationToken);

            return inquiries;
        }
    }
}
