using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.API.Middleware
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class AuthorizePermissionAttribute : AuthorizeAttribute
    {
        public AuthorizePermissionAttribute(string permission)
        {
            Policy = permission;
        }
    }

    public class PermissionRequirement : IAuthorizationRequirement
    {
        public string Permission { get; }

        public PermissionRequirement(string permission)
        {
            Permission = permission;
        }
    }

    public class PermissionPolicyProvider : DefaultAuthorizationPolicyProvider
    {
        public PermissionPolicyProvider(IOptions<AuthorizationOptions> options) : base(options)
        {
        }

        public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
        {
            var policy = await base.GetPolicyAsync(policyName);
            if (policy != null)
            {
                return policy;
            }

            return new AuthorizationPolicyBuilder()
                .AddRequirements(new PermissionRequirement(policyName))
                .Build();
        }
    }

    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly IApplicationDbContext _context;

        public PermissionAuthorizationHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PermissionRequirement requirement)
        {
            var user = context.User;
            if (user == null || user.Identity?.IsAuthenticated != true)
            {
                return;
            }

            // Extract the user's role from claims
            var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value 
                ?? user.FindFirst("role")?.Value;

            if (string.IsNullOrEmpty(roleClaim))
            {
                return;
            }

            // Admin bypasses all checks
            if (roleClaim.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            {
                context.Succeed(requirement);
                return;
            }

            // Check database to see if this role has the requested permission
            var hasPermission = await _context.RolePermissions
                .AnyAsync(rp => rp.Role.Name == roleClaim && rp.Permission.Name == requirement.Permission);

            if (hasPermission)
            {
                context.Succeed(requirement);
            }
        }
    }
}
