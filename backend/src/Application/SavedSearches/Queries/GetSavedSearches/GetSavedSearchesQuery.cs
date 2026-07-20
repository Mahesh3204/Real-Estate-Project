using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.SavedSearches.Queries.GetSavedSearches
{
    public class SavedSearchDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string QueryParameters { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
    }

    public class GetSavedSearchesQuery : IRequest<List<SavedSearchDto>>
    {
        public Guid UserId { get; set; }
    }

    public class GetSavedSearchesQueryHandler : IRequestHandler<GetSavedSearchesQuery, List<SavedSearchDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetSavedSearchesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<SavedSearchDto>> Handle(GetSavedSearchesQuery request, CancellationToken cancellationToken)
        {
            var result = await _context.SavedSearches
                .AsNoTracking()
                .Where(s => s.UserId == request.UserId)
                .OrderByDescending(s => s.CreatedDate)
                .Select(s => new SavedSearchDto
                {
                    Id = s.Id,
                    UserId = s.UserId,
                    Name = s.Name,
                    QueryParameters = s.QueryParameters,
                    CreatedDate = s.CreatedDate
                })
                .ToListAsync(cancellationToken);

            return result;
        }
    }
}
