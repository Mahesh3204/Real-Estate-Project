using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.History.Commands.AddRecentlyViewed
{
    public class AddRecentlyViewedCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
        public Guid PropertyId { get; set; }
    }

    public class AddRecentlyViewedCommandValidator : AbstractValidator<AddRecentlyViewedCommand>
    {
        public AddRecentlyViewedCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.PropertyId).NotEmpty();
        }
    }

    public class AddRecentlyViewedCommandHandler : IRequestHandler<AddRecentlyViewedCommand, bool>
    {
        private readonly IRecentlyViewedService _recentlyViewedService;

        public AddRecentlyViewedCommandHandler(IRecentlyViewedService recentlyViewedService)
        {
            _recentlyViewedService = recentlyViewedService;
        }

        public async Task<bool> Handle(AddRecentlyViewedCommand request, CancellationToken cancellationToken)
        {
            await _recentlyViewedService.AddToHistoryAsync(request.UserId, request.PropertyId);
            return true;
        }
    }
}
