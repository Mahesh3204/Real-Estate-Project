using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Locations.Queries
{
    public class CountryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class StateDto
    {
        public Guid Id { get; set; }
        public Guid CountryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class CityDto
    {
        public Guid Id { get; set; }
        public Guid StateId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class AreaDto
    {
        public Guid Id { get; set; }
        public Guid CityId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    // Queries
    public class GetCountriesQuery : IRequest<List<CountryDto>>
    {
        public bool IncludeInactive { get; set; } = false;
        public bool IncludeDeleted { get; set; } = false;
    }

    public class GetStatesQuery : IRequest<List<StateDto>>
    {
        public Guid CountryId { get; set; }
        public bool IncludeInactive { get; set; } = false;
        public bool IncludeDeleted { get; set; } = false;
    }

    public class GetCitiesQuery : IRequest<List<CityDto>>
    {
        public Guid StateId { get; set; }
        public bool IncludeInactive { get; set; } = false;
        public bool IncludeDeleted { get; set; } = false;
    }

    public class GetAreasQuery : IRequest<List<AreaDto>>
    {
        public Guid CityId { get; set; }
        public bool IncludeInactive { get; set; } = false;
        public bool IncludeDeleted { get; set; } = false;
    }

    // Handlers
    public class GetLocationsQueriesHandler :
        IRequestHandler<GetCountriesQuery, List<CountryDto>>,
        IRequestHandler<GetStatesQuery, List<StateDto>>,
        IRequestHandler<GetCitiesQuery, List<CityDto>>,
        IRequestHandler<GetAreasQuery, List<AreaDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetLocationsQueriesHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<CountryDto>> Handle(GetCountriesQuery request, CancellationToken cancellationToken)
        {
            var query = request.IncludeDeleted 
                ? _context.Countries.IgnoreQueryFilters().AsNoTracking()
                : _context.Countries.AsNoTracking();

            if (!request.IncludeInactive)
            {
                query = query.Where(c => c.IsActive);
            }

            return await query
                .OrderBy(c => c.Name)
                .Select(c => new CountryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Code = c.Code,
                    IsActive = c.IsActive
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<List<StateDto>> Handle(GetStatesQuery request, CancellationToken cancellationToken)
        {
            var query = request.IncludeDeleted 
                ? _context.States.IgnoreQueryFilters().AsNoTracking()
                : _context.States.AsNoTracking();

            query = query.Where(s => s.CountryId == request.CountryId);

            if (!request.IncludeInactive)
            {
                query = query.Where(s => s.IsActive);
            }

            return await query
                .OrderBy(s => s.Name)
                .Select(s => new StateDto
                {
                    Id = s.Id,
                    CountryId = s.CountryId,
                    Name = s.Name,
                    IsActive = s.IsActive
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<List<CityDto>> Handle(GetCitiesQuery request, CancellationToken cancellationToken)
        {
            var query = request.IncludeDeleted 
                ? _context.Cities.IgnoreQueryFilters().AsNoTracking()
                : _context.Cities.AsNoTracking();

            query = query.Where(c => c.StateId == request.StateId);

            if (!request.IncludeInactive)
            {
                query = query.Where(c => c.IsActive);
            }

            return await query
                .OrderBy(c => c.Name)
                .Select(c => new CityDto
                {
                    Id = c.Id,
                    StateId = c.StateId,
                    Name = c.Name,
                    IsActive = c.IsActive
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<List<AreaDto>> Handle(GetAreasQuery request, CancellationToken cancellationToken)
        {
            var query = request.IncludeDeleted 
                ? _context.Areas.IgnoreQueryFilters().AsNoTracking()
                : _context.Areas.AsNoTracking();

            query = query.Where(a => a.CityId == request.CityId);

            if (!request.IncludeInactive)
            {
                query = query.Where(a => a.IsActive);
            }

            return await query
                .OrderBy(a => a.Name)
                .Select(a => new AreaDto
                {
                    Id = a.Id,
                    CityId = a.CityId,
                    Name = a.Name,
                    IsActive = a.IsActive
                })
                .ToListAsync(cancellationToken);
        }
    }
}
