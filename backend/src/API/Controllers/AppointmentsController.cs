using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Appointments.Commands.BookAppointment;
using RealEstate.Application.Appointments.Commands.UpdateAppointmentStatus;
using RealEstate.Application.Appointments.Queries.GetAppointments;

namespace RealEstate.API.Controllers
{
    [Authorize]
    [Route("api/appointments")]
    public class AppointmentsController : ApiControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<AppointmentDto>>> GetAppointments([FromQuery] string viewType = "upcoming")
        {
            var result = await Mediator.Send(new GetAppointmentsQuery
            {
                UserId = CurrentUserId,
                ViewType = viewType
            });
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> BookAppointment(BookAppointmentCommand command)
        {
            if (command.BuyerId != CurrentUserId)
            {
                return BadRequest("Buyer ID mismatch.");
            }

            var id = await Mediator.Send(command);
            return Ok(id);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateAppointmentStatus(Guid id, UpdateAppointmentStatusCommand command)
        {
            if (id != command.AppointmentId)
            {
                return BadRequest("Appointment ID mismatch.");
            }

            var success = await Mediator.Send(command);
            return Ok(new { Success = success, Message = "Appointment status updated." });
        }
    }
}
