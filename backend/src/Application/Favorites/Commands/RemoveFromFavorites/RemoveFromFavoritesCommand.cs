using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Favorites.Commands.RemoveFromFavorites
{
    public class RemoveFromFavoritesCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
        public Guid PropertyId { get; set; }
    }

    public class RemoveFromFavoritesCommandValidator : AbstractValidator<RemoveFromFavoritesCommand>
    {
        public RemoveFromFavoritesCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.PropertyId).NotEmpty();
        }
    }

    public class RemoveFromFavoritesCommandHandler : IRequestHandler<RemoveFromFavoritesCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public RemoveFromFavoritesCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(RemoveFromFavoritesCommand request, CancellationToken cancellationToken)
        {
            var favorite = await _context.PropertyFavorites
                .FirstOrDefaultAsync(f => f.UserId == request.UserId && f.PropertyId == request.PropertyId, cancellationToken);

            if (favorite == null)
            {
                return true;
            }

            _context.PropertyFavorites.Remove(favorite);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
