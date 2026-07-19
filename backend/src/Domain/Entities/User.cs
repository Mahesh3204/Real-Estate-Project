using System;
using Microsoft.AspNetCore.Identity;

namespace RealEstate.Domain.Entities
{
    public class User : IdentityUser<Guid>
    {
        public User()
        {
            Id = Guid.NewGuid();
        }

        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // "Admin", "Agent", "Buyer", "Seller"
        public bool IsVerified { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }
        public string? ProfilePictureUrl { get; set; }

        public Guid? ActiveRoleId { get; set; }
        public Role? ActiveRole { get; set; }
    }
}
