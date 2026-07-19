using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace RealEstate.Domain.Entities
{
    public class Role : IdentityRole<Guid>
    {
        public Role() : base()
        {
            Id = Guid.NewGuid();
        }

        public Role(string name) : base(name)
        {
            Id = Guid.NewGuid();
            NormalizedName = name.ToUpperInvariant();
        }

        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
