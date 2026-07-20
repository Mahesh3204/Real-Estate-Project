using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.History.Commands.ClearRecentlyViewed
{
    public class ClearRecentlyViewedCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
    }

    public class ClearRecentlyViewedCommandHandler : IRequestHandler<ClearRecentlyViewedCommand, bool>
    {
        private readonly IRecentlyViewedService _recentlyViewedService;

        public ClearRecentlyViewedCommandHandler(IRecentlyViewedService recentlyViewedService)
        {
            _recentlyViewedService = recentlyViewedService;
        }

        public async Task<bool> Handle(ClearRecentlyViewedCommand request, CancellationToken cancellationToken)
        {
            await _recentlyViewedService.ClearHistoryAsync(request.UserId);
            return true;
        }
    }
}
