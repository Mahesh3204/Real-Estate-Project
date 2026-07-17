using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Favorites.Queries.GetFavorites
{
    public class GetFavoritesQuery : IRequest<List<Guid>>
    {
        public Guid UserId { get; set; }
    }

    public class GetFavoritesQueryHandler : IRequestHandler<GetFavoritesQuery, List<Guid>>
    {
        private readonly IApplicationDbContext _context;

        public GetFavoritesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Guid>> Handle(GetFavoritesQuery request, CancellationToken cancellationToken)
        {
            var propertyIds = await _context.PropertyFavorites
                .Where(f => f.UserId == request.UserId)
                .Select(f => f.PropertyId)
                .ToListAsync(cancellationToken);

            return propertyIds;
        }
    }
}
