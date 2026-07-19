using System;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using RealEstate.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Infrastructure.Security
{
    public class JwtTokenGenerator : IJwtTokenGenerator
    {
        private readonly IConfiguration _config;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly IApplicationDbContext _context;

        public JwtTokenGenerator(
            IConfiguration config,
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            IApplicationDbContext context)
        {
            _config = config;
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }

        public string GenerateToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured.")));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var roles = _userManager.GetRolesAsync(user).GetAwaiter().GetResult();

            // Get Active Role Name
            var activeRole = string.Empty;
            if (user.ActiveRoleId.HasValue)
            {
                var roleObj = _roleManager.FindByIdAsync(user.ActiveRoleId.Value.ToString()).GetAwaiter().GetResult();
                activeRole = roleObj?.Name ?? string.Empty;
            }
            if (string.IsNullOrEmpty(activeRole) && roles.Count > 0)
            {
                activeRole = roles.Contains("Buyer") ? "Buyer" : roles[0];
            }

            var claimsList = new System.Collections.Generic.List<System.Security.Claims.Claim>
            {
                new System.Security.Claims.Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new System.Security.Claims.Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new System.Security.Claims.Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Add all assigned roles as claims
            foreach (var role in roles)
            {
                claimsList.Add(new System.Security.Claims.Claim(ClaimTypes.Role, role));
                claimsList.Add(new System.Security.Claims.Claim("role", role));
            }

            // Also add ActiveRole claim
            if (!string.IsNullOrEmpty(activeRole))
            {
                claimsList.Add(new System.Security.Claims.Claim("ActiveRole", activeRole));
                claimsList.Add(new System.Security.Claims.Claim("activeRole", activeRole)); // case-insensitive redundancy
            }

            // Aggregate permissions for all assigned roles
            var roleGuids = _roleManager.Roles
                .Where(r => roles.Contains(r.Name!))
                .Select(r => r.Id)
                .ToList();

            var permissions = _context.RolePermissions
                .Include(rp => rp.Permission)
                .Where(rp => roleGuids.Contains(rp.RoleId))
                .Select(rp => rp.Permission.Name)
                .Distinct()
                .ToList();

            foreach (var perm in permissions)
            {
                claimsList.Add(new System.Security.Claims.Claim("Permission", perm));
            }

            var token = new JwtSecurityToken(
                issuer: _config["JwtSettings:Issuer"],
                audience: _config["JwtSettings:Audience"],
                claims: claimsList,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(_config["JwtSettings:ExpiryMinutes"] ?? "60")),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            return Guid.NewGuid().ToString("N");
        }

        public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true,
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _config["JwtSettings:Issuer"],
                ValidAudience = _config["JwtSettings:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured."))),
                ValidateLifetime = false // Here we want to extract claims from expired token
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token algorithm");
            }

            return principal;
        }
    }
}
