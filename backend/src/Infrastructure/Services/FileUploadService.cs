using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Infrastructure.Services
{
    public class FileUploadService : IFileUploadService
    {
        private readonly IWebHostEnvironment _webHostEnvironment;
        private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5MB
        private static readonly string[] AllowedMimeTypes = { "image/jpeg", "image/png", "image/webp", "image/svg+xml" };

        public FileUploadService(IWebHostEnvironment webHostEnvironment)
        {
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string subFolder)
        {
            // Validate MIME type
            if (!AllowedMimeTypes.Contains(contentType.ToLowerInvariant()))
            {
                throw new ArgumentException("Invalid file type. Only JPEG, PNG, WEBP, and SVG are allowed.");
            }

            // Validate Size
            if (fileStream.CanSeek && fileStream.Length > MaxFileSizeBytes)
            {
                throw new ArgumentException("File size exceeds 5MB limit.");
            }

            // Ensure upload directory exists
            string uploadsPath = Path.Combine(_webHostEnvironment.WebRootPath ?? "wwwroot", "uploads", subFolder);
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            // Generate unique filename
            string extension = Path.GetExtension(fileName);
            string uniqueFileName = $"{Guid.NewGuid()}{extension}";
            string fullPath = Path.Combine(uploadsPath, uniqueFileName);

            // Save to disk
            using (var destinationStream = new FileStream(fullPath, FileMode.Create))
            {
                await fileStream.CopyToAsync(destinationStream);
            }

            // Return relative public URL (standardizing with forward slashes)
            return $"/uploads/{subFolder}/{uniqueFileName}";
        }

        public void DeleteFile(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl)) return;

            // Extract relative path from URL (handling both absolute and relative URLs)
            string relativePath = fileUrl;
            if (fileUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                var uri = new Uri(fileUrl);
                relativePath = uri.LocalPath;
            }

            // Clean up leading slashes
            relativePath = relativePath.TrimStart('/');

            // Convert to absolute local path
            string fullPath = Path.Combine(_webHostEnvironment.WebRootPath ?? "wwwroot", relativePath);

            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }
        }
    }
}
