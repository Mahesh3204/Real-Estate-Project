using System.IO;
using System.Threading.Tasks;

namespace RealEstate.Application.Common.Interfaces
{
    public interface IFileUploadService
    {
        /// <summary>
        /// Validates and uploads a file to the local directory, returning the relative public URL.
        /// </summary>
        Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string subFolder);

        /// <summary>
        /// Deletes a file from local storage given its relative or absolute URL.
        /// </summary>
        void DeleteFile(string fileUrl);
    }
}
