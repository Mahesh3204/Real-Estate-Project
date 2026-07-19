using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealEstate.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRoleUpgradeTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ActiveRoleId",
                table: "users",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "role_requests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestedRoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReviewedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReviewNotes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_role_requests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_role_requests_roles_RequestedRoleId",
                        column: x => x.RequestedRoleId,
                        principalTable: "roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_role_requests_users_ReviewedBy",
                        column: x => x.ReviewedBy,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_role_requests_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "system_settings",
                columns: table => new
                {
                    Key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_system_settings", x => x.Key);
                });

            migrationBuilder.CreateTable(
                name: "role_request_histories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    OldStatus = table.Column<int>(type: "integer", nullable: false),
                    NewStatus = table.Column<int>(type: "integer", nullable: false),
                    ChangedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_role_request_histories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_role_request_histories_role_requests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "role_requests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_role_request_histories_users_ChangedBy",
                        column: x => x.ChangedBy,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_users_ActiveRoleId",
                table: "users",
                column: "ActiveRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_role_request_histories_ChangedBy",
                table: "role_request_histories",
                column: "ChangedBy");

            migrationBuilder.CreateIndex(
                name: "IX_role_request_histories_RequestId",
                table: "role_request_histories",
                column: "RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_role_requests_RequestedRoleId",
                table: "role_requests",
                column: "RequestedRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_role_requests_ReviewedBy",
                table: "role_requests",
                column: "ReviewedBy");

            migrationBuilder.CreateIndex(
                name: "IX_role_requests_UserId",
                table: "role_requests",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_users_roles_ActiveRoleId",
                table: "users",
                column: "ActiveRoleId",
                principalTable: "roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_users_roles_ActiveRoleId",
                table: "users");

            migrationBuilder.DropTable(
                name: "role_request_histories");

            migrationBuilder.DropTable(
                name: "system_settings");

            migrationBuilder.DropTable(
                name: "role_requests");

            migrationBuilder.DropIndex(
                name: "IX_users_ActiveRoleId",
                table: "users");

            migrationBuilder.DropColumn(
                name: "ActiveRoleId",
                table: "users");
        }
    }
}
