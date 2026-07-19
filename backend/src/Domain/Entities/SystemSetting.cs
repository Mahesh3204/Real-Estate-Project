using System;
using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities
{
    public class SystemSetting : IAuditable
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }
}
