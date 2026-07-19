using System;
using RealEstate.Domain.Common;
using RealEstate.Domain.Enums;

namespace RealEstate.Domain.Entities
{
    public class RoleRequestHistory : IAuditable
    {
        public RoleRequestHistory()
        {
            Id = Guid.NewGuid();
            ChangedAt = DateTime.UtcNow;
        }

        public Guid Id { get; set; }
        public Guid RequestId { get; set; }
        public RoleRequest Request { get; set; } = null!;

        public RoleRequestStatus OldStatus { get; set; }
        public RoleRequestStatus NewStatus { get; set; }

        public Guid ChangedBy { get; set; }
        public User ChangedByUser { get; set; } = null!;

        public DateTime ChangedAt { get; set; }
        public string? Notes { get; set; }
    }
}
