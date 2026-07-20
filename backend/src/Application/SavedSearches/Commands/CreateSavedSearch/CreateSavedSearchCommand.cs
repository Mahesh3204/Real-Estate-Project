using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.SavedSearches.Commands.CreateSavedSearch
{
    public class CreateSavedSearchCommand : IRequest<Guid>
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string QueryParameters { get; set; } = string.Empty;
    }

    public class CreateSavedSearchCommandValidator : AbstractValidator<CreateSavedSearchCommand>
    {
        public CreateSavedSearchCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
            RuleFor(x => x.QueryParameters).NotEmpty();
        }
    }

    public class CreateSavedSearchCommandHandler : IRequestHandler<CreateSavedSearchCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public CreateSavedSearchCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateSavedSearchCommand request, CancellationToken cancellationToken)
        {
            var savedSearch = new SavedSearch
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Name = request.Name,
                QueryParameters = request.QueryParameters,
                CreatedDate = DateTime.UtcNow
            };

            _context.SavedSearches.Add(savedSearch);
            await _context.SaveChangesAsync(cancellationToken);

            return savedSearch.Id;
        }
    }
}
