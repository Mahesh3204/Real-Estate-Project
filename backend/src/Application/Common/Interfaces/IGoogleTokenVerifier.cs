using System.Threading.Tasks;

namespace RealEstate.Application.Common.Interfaces
{
    public class GoogleUserPayload
    {
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? PictureUrl { get; set; }
    }

    public interface IGoogleTokenVerifier
    {
        Task<GoogleUserPayload?> VerifyTokenAsync(string idToken);
    }
}
