using System.Security.Claims;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Common.Interfaces
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}
