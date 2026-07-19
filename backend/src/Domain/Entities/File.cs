using System;

namespace RealEstate.Domain.Entities
{
    public class File
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
        public long SizeBytes { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
