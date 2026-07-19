using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.API.Controllers
{
    [Route("api/v1/files")]
    public class UploadController : ApiControllerBase
    {
        private readonly IFileUploadService _fileUploadService;
        private readonly IApplicationDbContext _context;

        public UploadController(IFileUploadService fileUploadService, IApplicationDbContext context)
        {
            _fileUploadService = fileUploadService;
            _context = context;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file, [FromForm] string? folder)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { Success = false, Message = "No file uploaded." });
            }

            try
            {
                string subFolder = folder ?? "general";

                using (var stream = file.OpenReadStream())
                {
                    string fileUrl = await _fileUploadService.UploadFileAsync(stream, file.FileName, file.ContentType, subFolder);

                    var dbFile = new Domain.Entities.File
                    {
                        FileName = file.FileName,
                        FilePath = fileUrl, // Relative path served as static
                        Url = fileUrl,
                        MimeType = file.ContentType,
                        SizeBytes = file.Length
                    };

                    _context.Files.Add(dbFile);
                    await _context.SaveChangesAsync();

                    return Ok(new
                    {
                        Success = true,
                        Message = "File uploaded successfully.",
                        Data = new
                        {
                            dbFile.Id,
                            dbFile.FileName,
                            dbFile.MimeType,
                            dbFile.SizeBytes,
                            dbFile.Url
                        }
                    });
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Success = false, Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var fileRecord = await _context.Files.FirstOrDefaultAsync(f => f.Id == id);
            if (fileRecord == null)
            {
                return NotFound(new { Success = false, Message = "File record not found." });
            }

            try
            {
                _fileUploadService.DeleteFile(fileRecord.Url);
                _context.Files.Remove(fileRecord);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Success = true,
                    Message = "File deleted successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Success = false, Message = ex.Message });
            }
        }
    }
}
