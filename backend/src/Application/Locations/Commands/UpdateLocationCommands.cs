using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Locations.Commands
{
    // Commands
    public class UpdateCountryCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class UpdateStateCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class UpdateCityCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class UpdateAreaCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    // Validators
    public class UpdateCountryCommandValidator : AbstractValidator<UpdateCountryCommand>
    {
        public UpdateCountryCommandValidator(IApplicationDbContext context)
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100)
                .MustAsync(async (command, name, cancel) => 
                {
                    var existing = await context.Countries.FirstOrDefaultAsync(c => c.Name == name, cancel);
                    return existing == null || existing.Id == command.Id;
                })
                .WithMessage("Country name must be unique.");

            RuleFor(x => x.Code).NotEmpty().MaximumLength(10)
                .MustAsync(async (command, code, cancel) => 
                {
                    var existing = await context.Countries.FirstOrDefaultAsync(c => c.Code == code, cancel);
                    return existing == null || existing.Id == command.Id;
                })
                .WithMessage("Country code must be unique.");
        }
    }

    public class UpdateStateCommandValidator : AbstractValidator<UpdateStateCommand>
    {
        public UpdateStateCommandValidator(IApplicationDbContext context)
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100)
                .MustAsync(async (command, name, cancel) => 
                {
                    var state = await context.States.FirstOrDefaultAsync(s => s.Id == command.Id, cancel);
                    if (state == null) return true;
                    var existing = await context.States.FirstOrDefaultAsync(s => s.CountryId == state.CountryId && s.Name == name, cancel);
                    return existing == null || existing.Id == command.Id;
                })
                .WithMessage("State name must be unique within its Country.");
        }
    }

    public class UpdateCityCommandValidator : AbstractValidator<UpdateCityCommand>
    {
        public UpdateCityCommandValidator(IApplicationDbContext context)
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100)
                .MustAsync(async (command, name, cancel) => 
                {
                    var city = await context.Cities.FirstOrDefaultAsync(c => c.Id == command.Id, cancel);
                    if (city == null) return true;
                    var existing = await context.Cities.FirstOrDefaultAsync(c => c.StateId == city.StateId && c.Name == name, cancel);
                    return existing == null || existing.Id == command.Id;
                })
                .WithMessage("City name must be unique within its State.");
        }
    }

    public class UpdateAreaCommandValidator : AbstractValidator<UpdateAreaCommand>
    {
        public UpdateAreaCommandValidator(IApplicationDbContext context)
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100)
                .MustAsync(async (command, name, cancel) => 
                {
                    var area = await context.Areas.FirstOrDefaultAsync(a => a.Id == command.Id, cancel);
                    if (area == null) return true;
                    var existing = await context.Areas.FirstOrDefaultAsync(a => a.CityId == area.CityId && a.Name == name, cancel);
                    return existing == null || existing.Id == command.Id;
                })
                .WithMessage("Area name must be unique within its City.");
        }
    }

    // Handlers
    public class UpdateLocationHandlers :
        IRequestHandler<UpdateCountryCommand, bool>,
        IRequestHandler<UpdateStateCommand, bool>,
        IRequestHandler<UpdateCityCommand, bool>,
        IRequestHandler<UpdateAreaCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public UpdateLocationHandlers(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateCountryCommand request, CancellationToken cancellationToken)
        {
            var country = await _context.Countries.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
            if (country == null) throw new Exception("Country not found.");

            country.Name = request.Name;
            country.Code = request.Code;
            country.IsActive = request.IsActive;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> Handle(UpdateStateCommand request, CancellationToken cancellationToken)
        {
            var state = await _context.States.FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);
            if (state == null) throw new Exception("State not found.");

            state.Name = request.Name;
            state.IsActive = request.IsActive;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> Handle(UpdateCityCommand request, CancellationToken cancellationToken)
        {
            var city = await _context.Cities.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
            if (city == null) throw new Exception("City not found.");

            city.Name = request.Name;
            city.IsActive = request.IsActive;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> Handle(UpdateAreaCommand request, CancellationToken cancellationToken)
        {
            var area = await _context.Areas.FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);
            if (area == null) throw new Exception("Area not found.");

            area.Name = request.Name;
            area.IsActive = request.IsActive;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
