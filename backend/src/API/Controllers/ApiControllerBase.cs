using System;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace RealEstate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class ApiControllerBase : ControllerBase
    {
        private ISender? _mediator;

        protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

        protected Guid CurrentUserId => Guid.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? throw new InvalidOperationException("User is not authenticated."));

        protected Guid? CurrentUserIdOptional
        {
            get
            {
                if (User.Identity?.IsAuthenticated != true) return null;
                var val = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                          ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                return val != null ? Guid.Parse(val) : null;
            }
        }

        protected string? CurrentUserRole => User.FindFirst(ClaimTypes.Role)?.Value;
    }
}
