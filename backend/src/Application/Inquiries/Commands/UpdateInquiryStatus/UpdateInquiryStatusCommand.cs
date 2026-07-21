using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Inquiries.Commands.UpdateInquiryStatus
{
    public class UpdateInquiryStatusCommand : IRequest<bool>
    {
        public Guid InquiryId { get; set; }
        public string Status { get; set; } = string.Empty; // "New", "Read", "Replied", "InProgress", "Closed", "Cancelled"
    }

    public class UpdateInquiryStatusCommandValidator : AbstractValidator<UpdateInquiryStatusCommand>
    {
        public UpdateInquiryStatusCommandValidator()
        {
            RuleFor(x => x.InquiryId).NotEmpty();
            RuleFor(x => x.Status).Must(status => Enum.TryParse<InquiryStatus>(status, true, out _))
                .WithMessage("Status must be a valid InquiryStatus: New, Read, Replied, InProgress, Closed, Cancelled.");
        }
    }

    public class UpdateInquiryStatusCommandHandler : IRequestHandler<UpdateInquiryStatusCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public UpdateInquiryStatusCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateInquiryStatusCommand request, CancellationToken cancellationToken)
        {
            var inquiry = await _context.PropertyInquiries.FindAsync(new object[] { request.InquiryId }, cancellationToken);

            if (inquiry == null)
            {
                throw new Exception("Inquiry not found.");
            }

            if (Enum.TryParse<InquiryStatus>(request.Status, true, out var parsedStatus))
            {
                inquiry.Status = parsedStatus;
            }
            inquiry.LastUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
