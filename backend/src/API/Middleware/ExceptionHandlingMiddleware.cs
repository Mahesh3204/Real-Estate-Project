using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RealEstate.Application.Common.Exceptions;

namespace RealEstate.API.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                // Suppress severe error logs for typical client/unauthorized request errors
                if (ex is not ValidationException && ex is not UnauthorizedAccessException)
                {
                    _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
                }
                else
                {
                    _logger.LogWarning("A client request error occurred: {Message}", ex.Message);
                }

                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var problemDetails = new ProblemDetails();

            switch (exception)
            {
                case ValidationException validationException:
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    problemDetails.Status = StatusCodes.Status400BadRequest;
                    problemDetails.Type = "https://tools.ietf.org/html/rfc7807";
                    problemDetails.Title = "One or more validation errors occurred.";
                    problemDetails.Detail = validationException.Message;
                    problemDetails.Extensions["errors"] = validationException.Errors;
                    break;

                case UnauthorizedAccessException unauthorizedException:
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    problemDetails.Status = StatusCodes.Status401Unauthorized;
                    problemDetails.Type = "https://tools.ietf.org/html/rfc7807";
                    problemDetails.Title = "Unauthorized";
                    problemDetails.Detail = unauthorizedException.Message;
                    break;

                default:
                    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                    problemDetails.Status = StatusCodes.Status500InternalServerError;
                    problemDetails.Title = "An internal server error occurred.";
                    problemDetails.Detail = "An unexpected error occurred on the server.";
                    break;
            }

            var result = JsonSerializer.Serialize(problemDetails);
            await context.Response.WriteAsync(result);
        }
    }
}
