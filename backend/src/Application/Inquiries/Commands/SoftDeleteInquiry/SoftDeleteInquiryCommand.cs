using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Inquiries.Commands.SoftDeleteInquiry
{
    public class SoftDeleteInquiryCommand : IRequest<bool>
    {
        public Guid InquiryId { get; set; }
    }

    public class SoftDeleteInquiryCommandValidator : AbstractValidator<SoftDeleteInquiryCommand>
    {
        public SoftDeleteInquiryCommandValidator()
        {
            RuleFor(x => x.InquiryId).NotEmpty();
        }
    }

    public class SoftDeleteInquiryCommandHandler : IRequestHandler<SoftDeleteInquiryCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public SoftDeleteInquiryCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(SoftDeleteInquiryCommand request, CancellationToken cancellationToken)
        {
            var inquiry = await _context.PropertyInquiries.FindAsync(new object[] { request.InquiryId }, cancellationToken);

            if (inquiry == null)
            {
                throw new Exception("Inquiry not found.");
            }

            inquiry.IsDeleted = true;
            inquiry.LastUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
