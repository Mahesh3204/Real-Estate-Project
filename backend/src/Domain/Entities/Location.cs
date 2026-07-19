using System;
using System.Collections.Generic;
using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities
{
    public class Country : IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty; // e.g. USA, CAN
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        public ICollection<State> States { get; set; } = new List<State>();
    }

    public class State : IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CountryId { get; set; }
        public Country Country { get; set; } = null!;
        
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        public ICollection<City> Cities { get; set; } = new List<City>();
    }

    public class City : IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid StateId { get; set; }
        public State State { get; set; } = null!;
        
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        public ICollection<Area> Areas { get; set; } = new List<Area>();
    }

    public class Area : IAuditable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CityId { get; set; }
        public City City { get; set; } = null!;
        
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;
    }
}
