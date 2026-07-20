using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RealEstate.Application.Common.Interfaces
{
    public interface IRecentlyViewedService
    {
        Task AddToHistoryAsync(Guid userId, Guid propertyId);
        Task<List<Guid>> GetHistoryAsync(Guid userId);
        Task ClearHistoryAsync(Guid userId);
    }
}
