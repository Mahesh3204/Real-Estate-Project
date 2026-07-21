using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Appointments.Queries.GetAppointments
{
    public class AppointmentDto
    {
        public Guid Id { get; set; }
        public Guid PropertyId { get; set; }
        public string PropertyTitle { get; set; } = string.Empty;
        public string PropertyAddress { get; set; } = string.Empty;
        public Guid BuyerId { get; set; }
        public string BuyerName { get; set; } = string.Empty;
        public Guid SellerId { get; set; }
        public string SellerName { get; set; } = string.Empty;
        public DateOnly Date { get; set; }
        public TimeOnly Time { get; set; }
        public string? Message { get; set; }
        public int VisitorCount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class GetAppointmentsQuery : IRequest<List<AppointmentDto>>
    {
        public Guid UserId { get; set; }
        public string ViewType { get; set; } = "upcoming"; // "upcoming" or "past"
    }

    public class GetAppointmentsQueryHandler : IRequestHandler<GetAppointmentsQuery, List<AppointmentDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAppointmentsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<AppointmentDto>> Handle(GetAppointmentsQuery request, CancellationToken cancellationToken)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var query = _context.Appointments
                .Include(a => a.Property)
                .Include(a => a.Buyer)
                .Include(a => a.Property!.Owner)
                .Where(a => a.BuyerId == request.UserId || a.Property!.OwnerId == request.UserId);

            if (request.ViewType.ToLower() == "upcoming")
            {
                query = query.Where(a => a.Date >= today && a.Status != AppointmentStatus.Cancelled && a.Status != AppointmentStatus.Completed && a.Status != AppointmentStatus.Rejected);
            }
            else // past
            {
                query = query.Where(a => a.Date < today || a.Status == AppointmentStatus.Cancelled || a.Status == AppointmentStatus.Completed || a.Status == AppointmentStatus.Rejected);
            }

            var appointments = await query
                .OrderBy(a => a.Date)
                .ThenBy(a => a.Time)
                .Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    PropertyId = a.PropertyId,
                    PropertyTitle = a.Property != null ? a.Property.Title : string.Empty,
                    PropertyAddress = a.Property != null ? a.Property.Address ?? string.Empty : string.Empty,
                    BuyerId = a.BuyerId,
                    BuyerName = a.Buyer != null ? $"{a.Buyer.FirstName} {a.Buyer.LastName}".Trim() : string.Empty,
                    SellerId = a.Property != null ? a.Property.OwnerId : Guid.Empty,
                    SellerName = (a.Property != null && a.Property.Owner != null) ? $"{a.Property.Owner.FirstName} {a.Property.Owner.LastName}".Trim() : string.Empty,
                    Date = a.Date,
                    Time = a.Time,
                    Message = a.Message,
                    VisitorCount = a.VisitorCount,
                    Status = a.Status.ToString(),
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return appointments;
        }
    }
}
