using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Users.Commands.UpdateProfile
{
    public class UpdateUserProfileCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public Guid? CountryId { get; set; }
        public Guid? StateId { get; set; }
        public Guid? CityId { get; set; }
        public string? Area { get; set; }
        public string? ZipCode { get; set; }
        public string Language { get; set; } = "en";
        public string Timezone { get; set; } = "UTC";
    }

    public class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand>
    {
        public UpdateUserProfileCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Phone).MaximumLength(20);
            RuleFor(x => x.Gender).MaximumLength(10);
            RuleFor(x => x.Area).MaximumLength(100);
            RuleFor(x => x.ZipCode).MaximumLength(20);
            RuleFor(x => x.Language).MaximumLength(10);
            RuleFor(x => x.Timezone).MaximumLength(50);
        }
    }

    public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, bool>
    {
        private readonly UserManager<User> _userManager;
        private readonly IApplicationDbContext _context;

        public UpdateUserProfileCommandHandler(UserManager<User> userManager, IApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<bool> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.Id == request.UserId, cancellationToken);
            if (profile == null)
            {
                profile = new Profile { Id = user.Id };
                _context.Profiles.Add(profile);
            }

            profile.FirstName = request.FirstName;
            profile.LastName = request.LastName;
            profile.Phone = request.Phone;
            profile.Gender = request.Gender;
            profile.DateOfBirth = request.DateOfBirth;
            profile.CountryId = request.CountryId;
            profile.StateId = request.StateId;
            profile.CityId = request.CityId;
            profile.Area = request.Area;
            profile.ZipCode = request.ZipCode;
            profile.Language = request.Language;
            profile.Timezone = request.Timezone;

            // Sync User entity details if necessary
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.PhoneNumber = request.Phone;

            var userResult = await _userManager.UpdateAsync(user);
            if (!userResult.Succeeded)
            {
                var errors = string.Join(", ", userResult.Errors.Select(e => e.Description));
                throw new Exception($"Failed to update user: {errors}");
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
