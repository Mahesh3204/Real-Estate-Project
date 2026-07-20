using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.SavedSearches.Commands.DeleteSavedSearch
{
    public class DeleteSavedSearchCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
    }

    public class DeleteSavedSearchCommandHandler : IRequestHandler<DeleteSavedSearchCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public DeleteSavedSearchCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteSavedSearchCommand request, CancellationToken cancellationToken)
        {
            var savedSearch = await _context.SavedSearches
                .Where(s => s.Id == request.Id && s.UserId == request.UserId)
                .FirstOrDefaultAsync(cancellationToken);

            if (savedSearch == null)
            {
                return false;
            }

            _context.SavedSearches.Remove(savedSearch);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
