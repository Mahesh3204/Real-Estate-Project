using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Inquiries.Commands.ReplyToInquiry
{
    public class ReplyToInquiryCommand : IRequest<bool>
    {
        public Guid InquiryId { get; set; }
        public string ReplyMessage { get; set; } = string.Empty;
    }

    public class ReplyToInquiryCommandValidator : AbstractValidator<ReplyToInquiryCommand>
    {
        public ReplyToInquiryCommandValidator()
        {
            RuleFor(x => x.InquiryId).NotEmpty();
            RuleFor(x => x.ReplyMessage).NotEmpty().MaximumLength(2000);
        }
    }

    public class ReplyToInquiryCommandHandler : IRequestHandler<ReplyToInquiryCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public ReplyToInquiryCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(ReplyToInquiryCommand request, CancellationToken cancellationToken)
        {
            var inquiry = await _context.PropertyInquiries.FindAsync(new object[] { request.InquiryId }, cancellationToken);

            if (inquiry == null)
            {
                throw new Exception("Inquiry not found.");
            }

            inquiry.ReplyMessage = request.ReplyMessage;
            inquiry.Status = InquiryStatus.Replied;
            inquiry.LastUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
