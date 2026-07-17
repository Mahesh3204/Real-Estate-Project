using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Infrastructure.Mail
{
    public class EmailSender : IEmailSender
    {
        private readonly ILogger<EmailSender> _logger;

        public EmailSender(ILogger<EmailSender> logger)
        {
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var logMessage = $"\n==================================================\n" +
                             $"EMAIL SENT TO: {to}\n" +
                             $"SUBJECT: {subject}\n" +
                             $"BODY:\n{body}\n" +
                             $"==================================================\n";

            _logger.LogInformation("{EmailLog}", logMessage);

            // Write to a temporary file in the workspace so user can read it if they can't access terminal logs
            try
            {
                var dir = Path.Combine(Directory.GetCurrentDirectory(), "temp-emails");
                if (!Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }
                var filePath = Path.Combine(dir, $"{Guid.NewGuid()}.txt");
                await File.WriteAllTextAsync(filePath, logMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to write email log to file.");
            }
        }
    }
}
