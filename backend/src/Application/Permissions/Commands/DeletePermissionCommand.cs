using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Permissions.Commands
{
    public class DeletePermissionCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }

    public class DeletePermissionCommandHandler : IRequestHandler<DeletePermissionCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public DeletePermissionCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeletePermissionCommand request, CancellationToken cancellationToken)
        {
            var permission = await _context.Permissions.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);
            if (permission == null)
            {
                throw new Exception($"Permission with ID {request.Id} was not found.");
            }

            _context.Permissions.Remove(permission);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
