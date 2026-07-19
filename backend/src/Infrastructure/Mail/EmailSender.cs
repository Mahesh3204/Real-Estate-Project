using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RealEstate.Application.Common.Interfaces;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace RealEstate.Infrastructure.Mail
{
    public class EmailSender : IEmailSender
    {
        private readonly ILogger<EmailSender> _logger;
        private readonly EmailSettings _emailSettings;

        public EmailSender(ILogger<EmailSender> logger, IOptions<EmailSettings> emailSettings)
        {
            _logger = logger;
            _emailSettings = emailSettings.Value;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                var smtpServer = _emailSettings.SmtpServer;
                var port = _emailSettings.Port;
                var senderName = _emailSettings.SenderName;
                var senderEmail = _emailSettings.SenderEmail;
                var username = _emailSettings.Username;
                var password = _emailSettings.Password;

                if (string.IsNullOrWhiteSpace(smtpServer))
                {
                    throw new InvalidOperationException("SMTP Server is not configured.");
                }

                if (string.IsNullOrWhiteSpace(senderEmail))
                {
                    throw new InvalidOperationException("Sender Email is not configured.");
                }

                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(senderName, senderEmail));
                email.To.Add(MailboxAddress.Parse(to));
                email.Subject = subject;

                var builder = new BodyBuilder { HtmlBody = body };
                email.Body = builder.ToMessageBody();

                using var smtp = new SmtpClient();

                // Select standard socket options based on commonly used SMTP ports
                var secureSocketOption = port == 465
                    ? SecureSocketOptions.SslOnConnect
                    : (port == 587 ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto);

                await smtp.ConnectAsync(smtpServer, port, secureSocketOption);

                if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
                {
                    await smtp.AuthenticateAsync(username, password);
                }

                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);

                _logger.LogInformation("Email sent successfully to {Recipient}", to);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Recipient} via SMTP", to);
                throw;
            }
        }
    }
}


