using System;
using System.Threading.Tasks;
using Google.Apis.Auth;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Infrastructure.Security
{
    public class GoogleTokenVerifier : IGoogleTokenVerifier
    {
        public async Task<GoogleUserPayload?> VerifyTokenAsync(string idToken)
        {
            try
            {
                // In production, validate token against client IDs. For demo, we validate signature.
                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken);

                if (payload == null) return null;

                return new GoogleUserPayload
                {
                    Email = payload.Email,
                    FirstName = payload.GivenName ?? "Google",
                    LastName = payload.FamilyName ?? "User",
                    PictureUrl = payload.Picture
                };
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}
