using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using RealEstate.Domain.Entities;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Inquiries.Commands.CreateInquiry
{
    public class CreateInquiryCommand : IRequest<Guid>
    {
        public Guid BuyerId { get; set; }
        public Guid PropertyId { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class CreateInquiryCommandValidator : AbstractValidator<CreateInquiryCommand>
    {
        public CreateInquiryCommandValidator()
        {
            RuleFor(x => x.BuyerId).NotEmpty();
            RuleFor(x => x.PropertyId).NotEmpty();
            RuleFor(x => x.Message).NotEmpty().MaximumLength(2000);
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
            var inquiry = new PropertyInquiry
            {
                BuyerId = request.BuyerId,
                PropertyId = request.PropertyId,
                Message = request.Message,
                Status = "Submitted",
                CreatedAt = DateTime.UtcNow,
                LastUpdatedAt = DateTime.UtcNow
            };

            _context.PropertyInquiries.Add(inquiry);
            await _context.SaveChangesAsync(cancellationToken);

            return inquiry.Id;
        }
    }
}
