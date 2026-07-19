using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Locations.Commands
{
    // Commands
    public class DeleteCountryCommand : IRequest<bool> { public Guid Id { get; set; } }
    public class DeleteStateCommand : IRequest<bool> { public Guid Id { get; set; } }
    public class DeleteCityCommand : IRequest<bool> { public Guid Id { get; set; } }
    public class DeleteAreaCommand : IRequest<bool> { public Guid Id { get; set; } }

    // Handlers
    public class DeleteLocationHandlers :
        IRequestHandler<DeleteCountryCommand, bool>,
        IRequestHandler<DeleteStateCommand, bool>,
        IRequestHandler<DeleteCityCommand, bool>,
        IRequestHandler<DeleteAreaCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public DeleteLocationHandlers(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteCountryCommand request, CancellationToken cancellationToken)
        {
            var country = await _context.Countries.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
            if (country == null) throw new Exception("Country not found.");

            // Soft delete country
            country.IsDeleted = true;
            country.IsActive = false;

            // Cascading soft delete for States
            var states = await _context.States.Where(s => s.CountryId == request.Id).ToListAsync(cancellationToken);
            var stateIds = states.Select(s => s.Id).ToList();

            foreach (var state in states)
            {
                state.IsDeleted = true;
                state.IsActive = false;
            }

            // Cascading soft delete for Cities
            var cities = await _context.Cities.Where(c => stateIds.Contains(c.StateId)).ToListAsync(cancellationToken);
            var cityIds = cities.Select(c => c.Id).ToList();

            foreach (var city in cities)
            {
                city.IsDeleted = true;
                city.IsActive = false;
            }

            // Cascading soft delete for Areas
            var areas = await _context.Areas.Where(a => cityIds.Contains(a.CityId)).ToListAsync(cancellationToken);
            foreach (var area in areas)
            {
                area.IsDeleted = true;
                area.IsActive = false;
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> Handle(DeleteStateCommand request, CancellationToken cancellationToken)
        {
            var state = await _context.States.FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);
            if (state == null) throw new Exception("State not found.");

            // Soft delete state
            state.IsDeleted = true;
            state.IsActive = false;

            // Cascading soft delete for Cities
            var cities = await _context.Cities.Where(c => c.StateId == request.Id).ToListAsync(cancellationToken);
            var cityIds = cities.Select(c => c.Id).ToList();

            foreach (var city in cities)
            {
                city.IsDeleted = true;
                city.IsActive = false;
            }

            // Cascading soft delete for Areas
            var areas = await _context.Areas.Where(a => cityIds.Contains(a.CityId)).ToListAsync(cancellationToken);
            foreach (var area in areas)
            {
                area.IsDeleted = true;
                area.IsActive = false;
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> Handle(DeleteCityCommand request, CancellationToken cancellationToken)
        {
            var city = await _context.Cities.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
            if (city == null) throw new Exception("City not found.");

            // Soft delete city
            city.IsDeleted = true;
            city.IsActive = false;

            // Cascading soft delete for Areas
            var areas = await _context.Areas.Where(a => a.CityId == request.Id).ToListAsync(cancellationToken);
            foreach (var area in areas)
            {
                area.IsDeleted = true;
                area.IsActive = false;
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> Handle(DeleteAreaCommand request, CancellationToken cancellationToken)
        {
            var area = await _context.Areas.FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);
            if (area == null) throw new Exception("Area not found.");

            // Soft delete area
            area.IsDeleted = true;
            area.IsActive = false;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
