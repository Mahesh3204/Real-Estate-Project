using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Favorites.Commands.AddToFavorites
{
    public class AddToFavoritesCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
        public Guid PropertyId { get; set; }
    }

    public class AddToFavoritesCommandValidator : AbstractValidator<AddToFavoritesCommand>
    {
        public AddToFavoritesCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.PropertyId).NotEmpty();
        }
    }

    public class AddToFavoritesCommandHandler : IRequestHandler<AddToFavoritesCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public AddToFavoritesCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(AddToFavoritesCommand request, CancellationToken cancellationToken)
        {
            var exists = await _context.PropertyFavorites
                .AnyAsync(f => f.UserId == request.UserId && f.PropertyId == request.PropertyId, cancellationToken);

            if (exists)
            {
                return true;
            }

            var favorite = new PropertyFavorite
            {
                UserId = request.UserId,
                PropertyId = request.PropertyId,
                CreatedAt = DateTime.UtcNow
            };

            _context.PropertyFavorites.Add(favorite);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
