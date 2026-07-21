using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Appointments.Commands.UpdateAppointmentStatus
{
    public class UpdateAppointmentStatusCommand : IRequest<bool>
    {
        public Guid AppointmentId { get; set; }
        public AppointmentStatus Status { get; set; }
        public DateOnly? NewDate { get; set; }
        public TimeOnly? NewTime { get; set; }
    }

    public class UpdateAppointmentStatusCommandValidator : AbstractValidator<UpdateAppointmentStatusCommand>
    {
        public UpdateAppointmentStatusCommandValidator()
        {
            RuleFor(x => x.AppointmentId).NotEmpty();
            RuleFor(x => x.Status).IsInEnum();
            RuleFor(x => x.NewDate).Must(date => !date.HasValue || date >= DateOnly.FromDateTime(DateTime.Today))
                .WithMessage("Rescheduled date cannot be in the past.");
        }
    }

    public class UpdateAppointmentStatusCommandHandler : IRequestHandler<UpdateAppointmentStatusCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public UpdateAppointmentStatusCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateAppointmentStatusCommand request, CancellationToken cancellationToken)
        {
            var appointment = await _context.Appointments.FindAsync(new object[] { request.AppointmentId }, cancellationToken);

            if (appointment == null)
            {
                throw new Exception("Appointment not found.");
            }

            appointment.Status = request.Status;
            
            if (request.Status == AppointmentStatus.Rescheduled)
            {
                if (request.NewDate.HasValue) appointment.Date = request.NewDate.Value;
                if (request.NewTime.HasValue) appointment.Time = request.NewTime.Value;
            }

            appointment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
