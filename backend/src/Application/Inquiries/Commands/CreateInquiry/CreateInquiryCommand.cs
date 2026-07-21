using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Inquiries.Commands.CreateInquiry
{
    public class CreateInquiryCommand : IRequest<Guid>
    {
        public Guid BuyerId { get; set; }
        public Guid PropertyId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public PreferredContactMethod PreferredContactMethod { get; set; } = PreferredContactMethod.Email;
        public string PreferredContactTime { get; set; } = string.Empty;
    }

    public class CreateInquiryCommandValidator : AbstractValidator<CreateInquiryCommand>
    {
        public CreateInquiryCommandValidator()
        {
            RuleFor(x => x.BuyerId).NotEmpty();
            RuleFor(x => x.PropertyId).NotEmpty();
            RuleFor(x => x.Subject).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Message).NotEmpty().MaximumLength(2000);
            RuleFor(x => x.Phone).NotEmpty().MaximumLength(20);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
            RuleFor(x => x.PreferredContactTime).MaximumLength(100);
        }
    }

    public class CreateInquiryCommandHandler : IRequestHandler<CreateInquiryCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public CreateInquiryCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateInquiryCommand request, CancellationToken cancellationToken)
        {
            // Verify buyer is not self-contacting
            var property = await _context.Properties.FindAsync(new object[] { request.PropertyId }, cancellationToken);
            if (property != null && property.OwnerId == request.BuyerId)
            {
                throw new Exception("Seller cannot create inquiries on own property.");
            }

            var inquiry = new PropertyInquiry
            {
                BuyerId = request.BuyerId,
                PropertyId = request.PropertyId,
                Subject = request.Subject,
                Message = request.Message,
                Phone = request.Phone,
                Email = request.Email,
                PreferredContactMethod = request.PreferredContactMethod,
                PreferredContactTime = request.PreferredContactTime,
                Status = InquiryStatus.New,
                CreatedAt = DateTime.UtcNow,
                LastUpdatedAt = DateTime.UtcNow
            };

            _context.PropertyInquiries.Add(inquiry);
            await _context.SaveChangesAsync(cancellationToken);

            return inquiry.Id;
        }
    }
}
