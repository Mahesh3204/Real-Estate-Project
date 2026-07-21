using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Appointments.Commands.BookAppointment;
using RealEstate.Application.Appointments.Commands.UpdateAppointmentStatus;
using RealEstate.Application.Appointments.Queries.GetAppointments;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using RealEstate.Infrastructure.Data;
using Xunit;

namespace RealEstate.Application.UnitTests.Appointments
{
    public class AppointmentTests : IDisposable
    {
        private readonly ApplicationDbContext _context;

        public AppointmentTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options, NSubstitute.Substitute.For<RealEstate.Application.Common.Interfaces.ICurrentUserService>());
        }

        [Fact]
        public async Task BookAppointment_ValidCommand_ShouldSaveAppointment()
        {
            // Arrange
            var command = new BookAppointmentCommand
            {
                PropertyId = Guid.NewGuid(),
                BuyerId = Guid.NewGuid(),
                Date = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                Time = new TimeOnly(10, 0),
                Message = "Visit test",
                VisitorCount = 2
            };

            var handler = new BookAppointmentCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeEmpty();
            var saved = await _context.Appointments.FindAsync(result);
            saved.Should().NotBeNull();
            saved!.PropertyId.Should().Be(command.PropertyId);
            saved.BuyerId.Should().Be(command.BuyerId);
            saved.Message.Should().Be(command.Message);
            saved.VisitorCount.Should().Be(command.VisitorCount);
            saved.Status.Should().Be(AppointmentStatus.Pending);
        }

        [Fact]
        public async Task UpdateAppointmentStatus_ValidCommand_ShouldUpdateStatus()
        {
            // Arrange
            var appointment = new Appointment
            {
                PropertyId = Guid.NewGuid(),
                BuyerId = Guid.NewGuid(),
                Date = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                Time = new TimeOnly(10, 0),
                VisitorCount = 1,
                Status = AppointmentStatus.Pending
            };
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            var command = new UpdateAppointmentStatusCommand
            {
                AppointmentId = appointment.Id,
                Status = AppointmentStatus.Approved
            };
            var handler = new UpdateAppointmentStatusCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            var updated = await _context.Appointments.FindAsync(appointment.Id);
            updated!.Status.Should().Be(AppointmentStatus.Approved);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
