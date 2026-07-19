using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Settings.Commands
{
    public class UpdateSettingCommand : IRequest<bool>
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    public class UpdateSettingCommandHandler : IRequestHandler<UpdateSettingCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public UpdateSettingCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateSettingCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Key))
            {
                throw new Exception("Setting Key cannot be empty.");
            }

            var setting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == request.Key, cancellationToken);

            if (setting == null)
            {
                setting = new SystemSetting
                {
                    Key = request.Key,
                    Value = request.Value
                };
                _context.SystemSettings.Add(setting);
            }
            else
            {
                setting.Value = request.Value;
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
