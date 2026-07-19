using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Permissions.Commands
{
    public class CreatePermissionCommand : IRequest<Guid>
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class CreatePermissionCommandValidator : AbstractValidator<CreatePermissionCommand>
    {
        private readonly IApplicationDbContext _context;

        public CreatePermissionCommandValidator(IApplicationDbContext context)
        {
            _context = context;

            RuleFor(v => v.Name)
                .NotEmpty().WithMessage("Permission name is required.")
                .MaximumLength(100).WithMessage("Permission name must not exceed 100 characters.")
                .MustAsync(async (name, cancellation) =>
                {
                    var exists = await _context.Permissions.AnyAsync(p => p.Name == name, cancellation);
                    return !exists;
                }).WithMessage("Permission name must be unique.");
        }
    }

    public class CreatePermissionCommandHandler : IRequestHandler<CreatePermissionCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public CreatePermissionCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreatePermissionCommand request, CancellationToken cancellationToken)
        {
            var permission = new Permission
            {
                Name = request.Name,
                Description = request.Description
            };

            _context.Permissions.Add(permission);
            await _context.SaveChangesAsync(cancellationToken);

            return permission.Id;
        }
    }
}
