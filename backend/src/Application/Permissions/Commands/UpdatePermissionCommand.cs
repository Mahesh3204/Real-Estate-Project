using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Permissions.Commands
{
    public class UpdatePermissionCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UpdatePermissionCommandValidator : AbstractValidator<UpdatePermissionCommand>
    {
        private readonly IApplicationDbContext _context;

        public UpdatePermissionCommandValidator(IApplicationDbContext context)
        {
            _context = context;

            RuleFor(v => v.Name)
                .NotEmpty().WithMessage("Permission name is required.")
                .MaximumLength(100).WithMessage("Permission name must not exceed 100 characters.")
                .MustAsync(async (command, name, cancellation) =>
                {
                    var existing = await _context.Permissions
                        .FirstOrDefaultAsync(p => p.Name == name, cancellation);

                    return existing == null || existing.Id == command.Id;
                }).WithMessage("Permission name must be unique.");
        }
    }

    public class UpdatePermissionCommandHandler : IRequestHandler<UpdatePermissionCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public UpdatePermissionCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdatePermissionCommand request, CancellationToken cancellationToken)
        {
            var permission = await _context.Permissions.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);
            if (permission == null)
            {
                throw new Exception($"Permission with ID {request.Id} was not found.");
            }

            permission.Name = request.Name;
            permission.Description = request.Description;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
