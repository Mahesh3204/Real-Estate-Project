using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Settings.Queries
{
    public class SystemSettingDto
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    public class GetSettingsQuery : IRequest<Dictionary<string, string>>
    {
    }

    public class GetSettingsQueryHandler : IRequestHandler<GetSettingsQuery, Dictionary<string, string>>
    {
        private readonly IApplicationDbContext _context;

        public GetSettingsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Dictionary<string, string>> Handle(GetSettingsQuery request, CancellationToken cancellationToken)
        {
            var settings = await _context.SystemSettings
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            // Seed default setting if empty
            if (!settings.Any(s => s.Key == "AutoApproveRoleRequests"))
            {
                var defaultSetting = new Domain.Entities.SystemSetting
                {
                    Key = "AutoApproveRoleRequests",
                    Value = "false"
                };
                _context.SystemSettings.Add(defaultSetting);
                await _context.SaveChangesAsync(cancellationToken);
                settings.Add(defaultSetting);
            }

            return settings.ToDictionary(s => s.Key, s => s.Value);
        }
    }
}
