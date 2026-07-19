using System;

namespace RealEstate.Domain.Entities
{
    public class Profile
    {
        public Guid Id { get; set; } // Matches User.Id (One-to-One)
        public User User { get; set; } = null!;

        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? Phone { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }

        public Guid? CountryId { get; set; }
        public Country? Country { get; set; }

        public Guid? StateId { get; set; }
        public State? State { get; set; }

        public Guid? CityId { get; set; }
        public City? City { get; set; }

        public string? Area { get; set; } // Free-text string per hybrid location reference
        public string? ZipCode { get; set; }
        public string Language { get; set; } = "en";
        public string Timezone { get; set; } = "UTC";
    }
}
