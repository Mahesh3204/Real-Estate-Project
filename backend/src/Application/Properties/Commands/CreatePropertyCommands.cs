using System;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Properties.Commands
{
    // Commands
    public class CreatePropertyDraftCommand : IRequest<Guid>
    {
        public string Title { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public ListingType ListingType { get; set; }
        public Guid OwnerId { get; set; }
    }

    // Validators
    public class CreatePropertyDraftCommandValidator : AbstractValidator<CreatePropertyDraftCommand>
    {
        public CreatePropertyDraftCommandValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        }
    }

    // Handlers
    public class CreatePropertyHandlers : IRequestHandler<CreatePropertyDraftCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public CreatePropertyHandlers(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreatePropertyDraftCommand request, CancellationToken cancellationToken)
        {
            var property = new Property
            {
                Title = request.Title,
                Price = request.Price,
                ListingType = request.ListingType,
                OwnerId = request.OwnerId,
                PublishStatus = PublishStatus.Draft,
                Slug = GenerateSlug(request.Title)
            };

            _context.Properties.Add(property);

            // Log draft creation in audit trail
            var log = new PropertyAuditLog
            {
                PropertyId = property.Id,
                UserId = request.OwnerId,
                OldStatus = PublishStatus.Draft,
                NewStatus = PublishStatus.Draft,
                Notes = "Draft property listing initialized."
            };
            _context.PropertyAuditLogs.Add(log);

            await _context.SaveChangesAsync(cancellationToken);
            return property.Id;
        }

        private string GenerateSlug(string title)
        {
            string slug = title.ToLowerInvariant();
            slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            slug = Regex.Replace(slug, @"\s+", " ").Trim();
            slug = Regex.Replace(slug, @"\s", "-");

            // Append random suffix to ensure uniqueness
            string suffix = Guid.NewGuid().ToString("N").Substring(0, 5);
            return $"{slug}-{suffix}";
        }
    }
}
