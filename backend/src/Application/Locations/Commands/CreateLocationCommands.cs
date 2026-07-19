using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Locations.Commands
{
    // Commands
    public class CreateCountryCommand : IRequest<Guid>
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }

    public class CreateStateCommand : IRequest<Guid>
    {
        public Guid CountryId { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CreateCityCommand : IRequest<Guid>
    {
        public Guid StateId { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CreateAreaCommand : IRequest<Guid>
    {
        public Guid CityId { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    // Validators
    public class CreateCountryCommandValidator : AbstractValidator<CreateCountryCommand>
    {
        public CreateCountryCommandValidator(IApplicationDbContext context)
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100)
                .MustAsync(async (name, cancel) => !await context.Countries.AnyAsync(c => c.Name == name, cancel))
                .WithMessage("Country name must be unique.");

            RuleFor(x => x.Code).NotEmpty().MaximumLength(10)
                .MustAsync(async (code, cancel) => !await context.Countries.AnyAsync(c => c.Code == code, cancel))
                .WithMessage("Country code must be unique.");
        }
    }

    public class CreateStateCommandValidator : AbstractValidator<CreateStateCommand>
    {
        public CreateStateCommandValidator(IApplicationDbContext context)
        {
            RuleFor(x => x.CountryId).NotEmpty()
                .MustAsync(async (id, cancel) => await context.Countries.AnyAsync(c => c.Id == id, cancel))
                .WithMessage("Valid Country ID is required.");

            RuleFor(x => x.Name).NotEmpty().MaximumLength(100)
                .MustAsync(async (command, name, cancel) => 
                    !await context.States.AnyAsync(s => s.CountryId == command.CountryId && s.Name == name, cancel))
                .WithMessage("State name must be unique within the selected Country.");
        }
    }

    public class CreateCityCommandValidator : AbstractValidator<CreateCityCommand>
    {
        public CreateCityCommandValidator(IApplicationDbContext context)
        {
            RuleFor(x => x.StateId).NotEmpty()
                .MustAsync(async (id, cancel) => await context.States.AnyAsync(s => s.Id == id, cancel))
                .WithMessage("Valid State ID is required.");

            RuleFor(x => x.Name).NotEmpty().MaximumLength(100)
                .MustAsync(async (command, name, cancel) => 
                    !await context.Cities.AnyAsync(c => c.StateId == command.StateId && c.Name == name, cancel))
                .WithMessage("City name must be unique within the selected State.");
        }
    }

    public class CreateAreaCommandValidator : AbstractValidator<CreateAreaCommand>
    {
        public CreateAreaCommandValidator(IApplicationDbContext context)
        {
            RuleFor(x => x.CityId).NotEmpty()
                .MustAsync(async (id, cancel) => await context.Cities.AnyAsync(c => c.Id == id, cancel))
                .WithMessage("Valid City ID is required.");

            RuleFor(x => x.Name).NotEmpty().MaximumLength(100)
                .MustAsync(async (command, name, cancel) => 
                    !await context.Areas.AnyAsync(a => a.CityId == command.CityId && a.Name == name, cancel))
                .WithMessage("Area name must be unique within the selected City.");
        }
    }

    // Handlers
    public class CreateLocationHandlers :
        IRequestHandler<CreateCountryCommand, Guid>,
        IRequestHandler<CreateStateCommand, Guid>,
        IRequestHandler<CreateCityCommand, Guid>,
        IRequestHandler<CreateAreaCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public CreateLocationHandlers(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateCountryCommand request, CancellationToken cancellationToken)
        {
            var country = new Country { Name = request.Name, Code = request.Code };
            _context.Countries.Add(country);
            await _context.SaveChangesAsync(cancellationToken);
            return country.Id;
        }

        public async Task<Guid> Handle(CreateStateCommand request, CancellationToken cancellationToken)
        {
            var state = new State { CountryId = request.CountryId, Name = request.Name };
            _context.States.Add(state);
            await _context.SaveChangesAsync(cancellationToken);
            return state.Id;
        }

        public async Task<Guid> Handle(CreateCityCommand request, CancellationToken cancellationToken)
        {
            var city = new City { StateId = request.StateId, Name = request.Name };
            _context.Cities.Add(city);
            await _context.SaveChangesAsync(cancellationToken);
            return city.Id;
        }

        public async Task<Guid> Handle(CreateAreaCommand request, CancellationToken cancellationToken)
        {
            var area = new Area { CityId = request.CityId, Name = request.Name };
            _context.Areas.Add(area);
            await _context.SaveChangesAsync(cancellationToken);
            return area.Id;
        }
    }
}
