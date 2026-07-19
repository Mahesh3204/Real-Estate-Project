using System;

namespace RealEstate.Domain.Events
{
    public class RoleRequestedEvent
    {
        public RoleRequestedEvent(Guid requestId, Guid userId, string requestedRole)
        {
            RequestId = requestId;
            UserId = userId;
            RequestedRole = requestedRole;
            Timestamp = DateTime.UtcNow;
        }

        public Guid RequestId { get; }
        public Guid UserId { get; }
        public string RequestedRole { get; }
        public DateTime Timestamp { get; }
    }

    public class RoleApprovedEvent
    {
        public RoleApprovedEvent(Guid requestId, Guid userId, string approvedRole, Guid approvedBy)
        {
            RequestId = requestId;
            UserId = userId;
            ApprovedRole = approvedRole;
            ApprovedBy = approvedBy;
            Timestamp = DateTime.UtcNow;
        }

        public Guid RequestId { get; }
        public Guid UserId { get; }
        public string ApprovedRole { get; }
        public Guid ApprovedBy { get; }
        public DateTime Timestamp { get; }
    }

    public class RoleRejectedEvent
    {
        public RoleRejectedEvent(Guid requestId, Guid userId, string rejectedRole, Guid rejectedBy, string notes)
        {
            RequestId = requestId;
            UserId = userId;
            RejectedRole = rejectedRole;
            RejectedBy = rejectedBy;
            Notes = notes;
            Timestamp = DateTime.UtcNow;
        }

        public Guid RequestId { get; }
        public Guid UserId { get; }
        public string RejectedRole { get; }
        public Guid RejectedBy { get; }
        public string Notes { get; }
        public DateTime Timestamp { get; }
    }

    public class RoleAssignedEvent
    {
        public RoleAssignedEvent(Guid userId, string role, Guid assignedBy)
        {
            UserId = userId;
            Role = role;
            AssignedBy = assignedBy;
            Timestamp = DateTime.UtcNow;
        }

        public Guid UserId { get; }
        public string Role { get; }
        public Guid AssignedBy { get; }
        public DateTime Timestamp { get; }
    }

    public class RoleRemovedEvent
    {
        public RoleRemovedEvent(Guid userId, string role, Guid removedBy)
        {
            UserId = userId;
            Role = role;
            RemovedBy = removedBy;
            Timestamp = DateTime.UtcNow;
        }

        public Guid UserId { get; }
        public string Role { get; }
        public Guid RemovedBy { get; }
        public DateTime Timestamp { get; }
    }

    public class ActiveRoleChangedEvent
    {
        public ActiveRoleChangedEvent(Guid userId, string activeRole)
        {
            UserId = userId;
            ActiveRole = activeRole;
            Timestamp = DateTime.UtcNow;
        }

        public Guid UserId { get; }
        public string ActiveRole { get; }
        public DateTime Timestamp { get; }
    }
}
