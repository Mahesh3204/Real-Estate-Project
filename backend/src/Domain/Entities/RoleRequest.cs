using System;
using RealEstate.Domain.Common;
using RealEstate.Domain.Enums;

namespace RealEstate.Domain.Entities
{
    public class RoleRequest : IAuditable
    {
        public RoleRequest()
        {
            Id = Guid.NewGuid();
            SubmittedAt = DateTime.UtcNow;
            Status = RoleRequestStatus.Pending;
        }

        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid RequestedRoleId { get; set; }
        public Role RequestedRole { get; set; } = null!;

        public RoleRequestStatus Status { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }

        public Guid? ReviewedBy { get; set; }
        public User? Reviewer { get; set; }

        public DateTime? ReviewedAt { get; set; }
        public string? ReviewNotes { get; set; }
    }
}
