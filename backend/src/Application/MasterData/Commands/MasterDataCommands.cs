using System;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.MasterData.Commands
{
    // --- Commands ---

    // Categories
    public class CreateCategoryCommand : IRequest<Guid>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class UpdateCategoryCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class DeleteCategoryCommand : IRequest<bool> { public Guid Id { get; set; } }

    // Types
    public class CreatePropertyTypeCommand : IRequest<Guid>
    {
        public Guid CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class UpdatePropertyTypeCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class DeletePropertyTypeCommand : IRequest<bool> { public Guid Id { get; set; } }

    // Statuses
    public class CreateStatusCommand : IRequest<Guid>
    {
        public string Name { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
    }

    public class UpdateStatusCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class DeleteStatusCommand : IRequest<bool> { public Guid Id { get; set; } }

    // Conditions
    public class CreateConditionCommand : IRequest<Guid> { public string Name { get; set; } = string.Empty; }
    public class UpdateConditionCommand : IRequest<bool> { public Guid Id { get; set; } public string Name { get; set; } = string.Empty; }

    public class DeleteConditionCommand : IRequest<bool> { public Guid Id { get; set; } }

    // Amenities
    public class CreateAmenityCommand : IRequest<Guid>
    {
        public string Name { get; set; } = string.Empty;
        public string? IconUrl { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class UpdateAmenityCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? IconUrl { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class DeleteAmenityCommand : IRequest<bool> { public Guid Id { get; set; } }

    // --- Validators ---

    public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
    {
        public CreateCategoryCommandValidator(IApplicationDbContext context)
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100)
                .MustAsync(async (name, cancel) => !await context.PropertyCategories.AnyAsync(c => c.Name == name, cancel))
                .WithMessage("Category name must be unique.");
        }
    }

    public class CreatePropertyTypeCommandValidator : AbstractValidator<CreatePropertyTypeCommand>
    {
        public CreatePropertyTypeCommandValidator(IApplicationDbContext context)
        {
            RuleFor(x => x.CategoryId).NotEmpty();
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100)
                .MustAsync(async (command, name, cancel) =>
                    !await context.PropertyTypes.AnyAsync(t => t.CategoryId == command.CategoryId && t.Name == name, cancel))
                .WithMessage("Property Type name must be unique within its Category.");
        }
    }

    public class CreateStatusCommandValidator : AbstractValidator<CreateStatusCommand>
    {
        public CreateStatusCommandValidator(IApplicationDbContext context)
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(50)
                .MustAsync(async (name, cancel) => !await context.PropertyStatuses.AnyAsync(s => s.Name == name, cancel))
                .WithMessage("Status name must be unique.");
        }
    }

    public class CreateConditionCommandValidator : AbstractValidator<CreateConditionCommand>
    {
        public CreateConditionCommandValidator(IApplicationDbContext context)
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(50)
                .MustAsync(async (name, cancel) => !await context.PropertyConditions.AnyAsync(c => c.Name == name, cancel))
                .WithMessage("Condition name must be unique.");
        }
    }

    public class CreateAmenityCommandValidator : AbstractValidator<CreateAmenityCommand>
    {
        public CreateAmenityCommandValidator(IApplicationDbContext context)
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100)
                .MustAsync(async (name, cancel) => !await context.Amenities.AnyAsync(a => a.Name == name, cancel))
                .WithMessage("Amenity name must be unique.");
        }
    }

    // --- Handlers ---

    public class MasterDataCommandsHandler :
        IRequestHandler<CreateCategoryCommand, Guid>,
        IRequestHandler<UpdateCategoryCommand, bool>,
        IRequestHandler<DeleteCategoryCommand, bool>,
        IRequestHandler<CreatePropertyTypeCommand, Guid>,
        IRequestHandler<UpdatePropertyTypeCommand, bool>,
        IRequestHandler<DeletePropertyTypeCommand, bool>,
        IRequestHandler<CreateStatusCommand, Guid>,
        IRequestHandler<UpdateStatusCommand, bool>,
        IRequestHandler<DeleteStatusCommand, bool>,
        IRequestHandler<CreateConditionCommand, Guid>,
        IRequestHandler<UpdateConditionCommand, bool>,
        IRequestHandler<DeleteConditionCommand, bool>,
        IRequestHandler<CreateAmenityCommand, Guid>,
        IRequestHandler<UpdateAmenityCommand, bool>,
        IRequestHandler<DeleteAmenityCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public MasterDataCommandsHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        private static string Slugify(string phrase)
        {
            var str = phrase.ToLowerInvariant();
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
            str = Regex.Replace(str, @"\s+", " ").Trim();
            str = str.Substring(0, str.Length <= 45 ? str.Length : 45).Trim();
            str = Regex.Replace(str, @"\s", "-");
            return str;
        }

        // Categories
        public async Task<Guid> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = new PropertyCategory
            {
                Name = request.Name,
                Slug = Slugify(request.Name),
                Description = request.Description,
                ImageUrl = request.ImageUrl,
                DisplayOrder = request.DisplayOrder
            };
            _context.PropertyCategories.Add(category);
            await _context.SaveChangesAsync(cancellationToken);
            return category.Id;
        }

        public async Task<bool> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await _context.PropertyCategories.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
            if (category == null) throw new Exception("Category not found.");

            category.Name = request.Name;
            category.Slug = Slugify(request.Name);
            category.Description = request.Description;
            category.ImageUrl = request.ImageUrl;
            category.DisplayOrder = request.DisplayOrder;
            category.IsActive = request.IsActive;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await _context.PropertyCategories.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
            if (category == null) throw new Exception("Category not found.");

            category.IsDeleted = true;
            category.IsActive = false;

            // Cascading set active state of child types to false
            var types = await _context.PropertyTypes.Where(t => t.CategoryId == request.Id).ToListAsync(cancellationToken);
            foreach (var t in types)
            {
                t.IsActive = false;
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        // Types
        public async Task<Guid> Handle(CreatePropertyTypeCommand request, CancellationToken cancellationToken)
        {
            var type = new PropertyType
            {
                CategoryId = request.CategoryId,
                Name = request.Name,
                Slug = Slugify(request.Name),
                Description = request.Description,
                DisplayOrder = request.DisplayOrder
            };
            _context.PropertyTypes.Add(type);
            await _context.SaveChangesAsync(cancellationToken);
            return type.Id;
        }

        public async Task<bool> Handle(UpdatePropertyTypeCommand request, CancellationToken cancellationToken)
        {
            var type = await _context.PropertyTypes.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);
            if (type == null) throw new Exception("Property Type not found.");

            type.Name = request.Name;
            type.Slug = Slugify(request.Name);
            type.Description = request.Description;
            type.DisplayOrder = request.DisplayOrder;
            type.IsActive = request.IsActive;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> Handle(DeletePropertyTypeCommand request, CancellationToken cancellationToken)
        {
            var type = await _context.PropertyTypes.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);
            if (type == null) throw new Exception("Property Type not found.");

            _context.PropertyTypes.Remove(type);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        // Statuses
        public async Task<Guid> Handle(CreateStatusCommand request, CancellationToken cancellationToken)
        {
            var status = new PropertyStatus { Name = request.Name, DisplayOrder = request.DisplayOrder };
            _context.PropertyStatuses.Add(status);
            await _context.SaveChangesAsync(cancellationToken);
            return status.Id;
        }

        public async Task<bool> Handle(UpdateStatusCommand request, CancellationToken cancellationToken)
        {
            var status = await _context.PropertyStatuses.FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);
            if (status == null) throw new Exception("Status not found.");

            status.Name = request.Name;
            status.DisplayOrder = request.DisplayOrder;
            status.IsActive = request.IsActive;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> Handle(DeleteStatusCommand request, CancellationToken cancellationToken)
        {
            var status = await _context.PropertyStatuses.FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);
            if (status == null) throw new Exception("Status not found.");

            _context.PropertyStatuses.Remove(status);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        // Conditions
        public async Task<Guid> Handle(CreateConditionCommand request, CancellationToken cancellationToken)
        {
            var condition = new PropertyCondition { Name = request.Name };
            _context.PropertyConditions.Add(condition);
            await _context.SaveChangesAsync(cancellationToken);
            return condition.Id;
        }

        public async Task<bool> Handle(UpdateConditionCommand request, CancellationToken cancellationToken)
        {
            var condition = await _context.PropertyConditions.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
            if (condition == null) throw new Exception("Condition not found.");

            condition.Name = request.Name;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> Handle(DeleteConditionCommand request, CancellationToken cancellationToken)
        {
            var condition = await _context.PropertyConditions.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
            if (condition == null) throw new Exception("Condition not found.");

            _context.PropertyConditions.Remove(condition);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        // Amenities
        public async Task<Guid> Handle(CreateAmenityCommand request, CancellationToken cancellationToken)
        {
            var amenity = new Amenity
            {
                Name = request.Name,
                Slug = Slugify(request.Name),
                IconUrl = request.IconUrl,
                Category = request.Category,
                Description = request.Description,
                DisplayOrder = request.DisplayOrder
            };
            _context.Amenities.Add(amenity);
            await _context.SaveChangesAsync(cancellationToken);
            return amenity.Id;
        }

        public async Task<bool> Handle(UpdateAmenityCommand request, CancellationToken cancellationToken)
        {
            var amenity = await _context.Amenities.FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);
            if (amenity == null) throw new Exception("Amenity not found.");

            amenity.Name = request.Name;
            amenity.Slug = Slugify(request.Name);
            amenity.IconUrl = request.IconUrl;
            amenity.Category = request.Category;
            amenity.Description = request.Description;
            amenity.DisplayOrder = request.DisplayOrder;
            amenity.IsActive = request.IsActive;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> Handle(DeleteAmenityCommand request, CancellationToken cancellationToken)
        {
            var amenity = await _context.Amenities.FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);
            if (amenity == null) throw new Exception("Amenity not found.");

            amenity.IsDeleted = true;
            amenity.IsActive = false;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
