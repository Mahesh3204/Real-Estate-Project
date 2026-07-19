using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Properties.Commands
{
    // Commands
    public class AdminApprovePropertyCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public Guid AdminUserId { get; set; }
    }

    public class AdminRejectPropertyCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public Guid AdminUserId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class AdminForceDeletePropertyCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }

    // Validators
    public class AdminRejectPropertyCommandValidator : AbstractValidator<AdminRejectPropertyCommand>
    {
        public AdminRejectPropertyCommandValidator()
        {
            RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
        }
    }

    // Handlers
    public class ModerationPropertyHandlers :
        IRequestHandler<AdminApprovePropertyCommand, bool>,
        IRequestHandler<AdminRejectPropertyCommand, bool>,
        IRequestHandler<AdminForceDeletePropertyCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public ModerationPropertyHandlers(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(AdminApprovePropertyCommand request, CancellationToken cancellationToken)
        {
            var p = await _context.Properties.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            if (p == null) throw new KeyNotFoundException("Property not found.");

            var oldStatus = p.PublishStatus;
            p.PublishStatus = PublishStatus.Published;

            // Log Audit trail
            var log = new PropertyAuditLog
            {
                PropertyId = p.Id,
                UserId = request.AdminUserId,
                OldStatus = oldStatus,
                NewStatus = PublishStatus.Published,
                Notes = "Admin approved listing. Status changed to Published."
            };
            _context.PropertyAuditLogs.Add(log);

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> Handle(AdminRejectPropertyCommand request, CancellationToken cancellationToken)
        {
            var p = await _context.Properties.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            if (p == null) throw new KeyNotFoundException("Property not found.");

            var oldStatus = p.PublishStatus;
            p.PublishStatus = PublishStatus.Rejected;

            // Log Audit trail with rejection comments
            var log = new PropertyAuditLog
            {
                PropertyId = p.Id,
                UserId = request.AdminUserId,
                OldStatus = oldStatus,
                NewStatus = PublishStatus.Rejected,
                Notes = $"Admin rejected listing. Reason: {request.Reason}"
            };
            _context.PropertyAuditLogs.Add(log);

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> Handle(AdminForceDeletePropertyCommand request, CancellationToken cancellationToken)
        {
            var p = await _context.Properties.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            if (p == null) throw new KeyNotFoundException("Property not found.");

            _context.Properties.Remove(p);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
