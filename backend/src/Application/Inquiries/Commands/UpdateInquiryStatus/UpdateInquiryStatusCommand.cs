using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Inquiries.Commands.UpdateInquiryStatus
{
    public class UpdateInquiryStatusCommand : IRequest<bool>
    {
        public Guid InquiryId { get; set; }
        public string Status { get; set; } = string.Empty; // "Submitted", "Read", "Responded", "Closed", "Archived"
    }

    public class UpdateInquiryStatusCommandValidator : AbstractValidator<UpdateInquiryStatusCommand>
    {
        public UpdateInquiryStatusCommandValidator()
        {
            RuleFor(x => x.InquiryId).NotEmpty();
            RuleFor(x => x.Status).Must(status => status is "Submitted" or "Read" or "Responded" or "Closed" or "Archived")
                .WithMessage("Status must be one of the following: Submitted, Read, Responded, Closed, Archived.");
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

            inquiry.Status = request.Status;
            inquiry.LastUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
