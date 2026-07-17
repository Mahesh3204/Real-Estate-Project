using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Users.Commands.GoogleLogin;
using RealEstate.Application.Users.Commands.LoginUser;
using RealEstate.Application.Users.Commands.RegisterUser;
using RealEstate.Application.Users.Commands.VerifyOtp;
using RealEstate.Application.Users.Commands.ResetPassword;

namespace RealEstate.API.Controllers
{
    public class AuthController : ApiControllerBase
    {
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterUserCommand command)
        {
            var userId = await Mediator.Send(command);

            return Ok(new
            {
                Message = "Registration successful. Please enter the OTP sent to your email.",
                UserId = userId
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResult>> Login(LoginUserCommand command)
        {
            var result = await Mediator.Send(command);

            // Set refresh token in HTTP-only secure cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("refreshToken", "mocked-refresh-token", cookieOptions);

            return Ok(result);
        }

        [HttpPost("google")]
        public async Task<ActionResult<LoginResult>> GoogleLogin(GoogleLoginCommand command)
        {
            var result = await Mediator.Send(command);

            // Set refresh token in HTTP-only secure cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("refreshToken", "mocked-refresh-token", cookieOptions);

            return Ok(result);
        }

        [HttpPost("verify")]
        public async Task<IActionResult> Verify(VerifyOtpCommand command)
        {
            var success = await Mediator.Send(command);
            return Ok(new { Success = success, Message = "Verification successful." });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordCommand command)
        {
            var success = await Mediator.Send(command);
            return Ok(new { Success = success, Message = "If the email matches a registered user, a reset token has been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordCommand command)
        {
            var success = await Mediator.Send(command);
            return Ok(new { Success = success, Message = "Password reset successful." });
        }
    }
}
