using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.History.Queries.GetRecentlyViewed
{
    public class GetRecentlyViewedQuery : IRequest<List<Guid>>
    {
        public Guid UserId { get; set; }
    }

    public class GetRecentlyViewedQueryHandler : IRequestHandler<GetRecentlyViewedQuery, List<Guid>>
    {
        private readonly IRecentlyViewedService _recentlyViewedService;

        public GetRecentlyViewedQueryHandler(IRecentlyViewedService recentlyViewedService)
        {
            _recentlyViewedService = recentlyViewedService;
        }

        public async Task<List<Guid>> Handle(GetRecentlyViewedQuery request, CancellationToken cancellationToken)
        {
            return await _recentlyViewedService.GetHistoryAsync(request.UserId);
        }
    }
}
