using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Appointments.Commands.BookAppointment
{
    public class BookAppointmentCommand : IRequest<Guid>
    {
        public Guid PropertyId { get; set; }
        public Guid BuyerId { get; set; }
        public DateOnly Date { get; set; }
        public TimeOnly Time { get; set; }
        public string? Message { get; set; }
        public int VisitorCount { get; set; }
    }

    public class BookAppointmentCommandValidator : AbstractValidator<BookAppointmentCommand>
    {
        public BookAppointmentCommandValidator()
        {
            RuleFor(x => x.PropertyId).NotEmpty();
            RuleFor(x => x.BuyerId).NotEmpty();
            RuleFor(x => x.Date).Must(date => date >= DateOnly.FromDateTime(DateTime.Today))
                .WithMessage("Appointment date cannot be in the past.");
            RuleFor(x => x.VisitorCount).GreaterThan(0).WithMessage("Visitor count must be positive.");
            RuleFor(x => x.Message).MaximumLength(1000);
        }
    }

    public class BookAppointmentCommandHandler : IRequestHandler<BookAppointmentCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public BookAppointmentCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(BookAppointmentCommand request, CancellationToken cancellationToken)
        {
            // Verify buyer is not the property owner
            var property = await _context.Properties.FindAsync(new object[] { request.PropertyId }, cancellationToken);
            if (property != null && property.OwnerId == request.BuyerId)
            {
                throw new Exception("Seller cannot book appointments on own property.");
            }

            // Check for duplicate pending appointment
            var hasPending = await _context.Appointments
                .AnyAsync(a => a.BuyerId == request.BuyerId && a.PropertyId == request.PropertyId && a.Status == AppointmentStatus.Pending, cancellationToken);
            
            if (hasPending)
            {
                throw new Exception("You already have a pending appointment for this property.");
            }

            var appointment = new Appointment
            {
                PropertyId = request.PropertyId,
                BuyerId = request.BuyerId,
                Date = request.Date,
                Time = request.Time,
                Message = request.Message,
                VisitorCount = request.VisitorCount,
                Status = AppointmentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync(cancellationToken);

            return appointment.Id;
        }
    }
}
