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

            // Extract all roles user possesses
            var roles = user.FindAll(ClaimTypes.Role)
                .Select(c => c.Value)
                .Concat(user.FindAll("role").Select(c => c.Value))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            // Extract ActiveRole
            var activeRole = user.FindFirst("ActiveRole")?.Value
                ?? user.FindFirst("activeRole")?.Value;

            // Admin bypasses all checks
            if (roles.Contains("Admin", StringComparer.OrdinalIgnoreCase) || 
                (activeRole != null && activeRole.Equals("Admin", StringComparison.OrdinalIgnoreCase)))
            {
                context.Succeed(requirement);
                return;
            }

            // Check active role if present, else fall back to all user roles
            var rolesToCheck = !string.IsNullOrEmpty(activeRole)
                ? new System.Collections.Generic.List<string> { activeRole }
                : roles;

            if (rolesToCheck.Count == 0)
            {
                return;
            }

            // Check database to see if any of target roles has the requested permission
            var hasPermission = await _context.RolePermissions
                .AnyAsync(rp => rolesToCheck.Contains(rp.Role.Name) && rp.Permission.Name == requirement.Permission);

            if (hasPermission)
            {
                context.Succeed(requirement);
            }
        }
    }
}
