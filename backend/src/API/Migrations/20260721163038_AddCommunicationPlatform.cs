using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealEstate.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCommunicationPlatform : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PropertyInquiries_users_BuyerId",
                table: "PropertyInquiries");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PropertyInquiries",
                table: "PropertyInquiries");

            migrationBuilder.DropIndex(
                name: "IX_PropertyInquiries_BuyerId",
                table: "PropertyInquiries");

            migrationBuilder.RenameTable(
                name: "PropertyInquiries",
                newName: "property_inquiries");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "property_inquiries",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "property_inquiries",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "property_inquiries",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PreferredContactMethod",
                table: "property_inquiries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PreferredContactTime",
                table: "property_inquiries",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReplyMessage",
                table: "property_inquiries",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Subject",
                table: "property_inquiries",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_property_inquiries",
                table: "property_inquiries",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "appointments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PropertyId = table.Column<Guid>(type: "uuid", nullable: false),
                    BuyerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: true),
                    VisitorCount = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_appointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_appointments_properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_appointments_users_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "conversations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PropertyId = table.Column<Guid>(type: "uuid", nullable: false),
                    BuyerId = table.Column<Guid>(type: "uuid", nullable: false),
                    SellerId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastMessageAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeletedByBuyer = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBySeller = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_conversations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_conversations_properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_conversations_users_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_conversations_users_SellerId",
                        column: x => x.SellerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RecipientId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_notifications_users_RecipientId",
                        column: x => x.RecipientId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "offers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PropertyId = table.Column<Guid>(type: "uuid", nullable: false),
                    BuyerId = table.Column<Guid>(type: "uuid", nullable: false),
                    OfferAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: true),
                    ExpirationDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_offers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_offers_properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_offers_users_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "reviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PropertyId = table.Column<Guid>(type: "uuid", nullable: false),
                    BuyerId = table.Column<Guid>(type: "uuid", nullable: false),
                    SellerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Comment = table.Column<string>(type: "text", nullable: false),
                    Images = table.Column<string>(type: "text", nullable: true),
                    ReplyContent = table.Column<string>(type: "text", nullable: true),
                    IsReported = table.Column<bool>(type: "boolean", nullable: false),
                    IsHidden = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_reviews_properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_reviews_users_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_reviews_users_SellerId",
                        column: x => x.SellerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderId = table.Column<Guid>(type: "uuid", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    ContentType = table.Column<int>(type: "integer", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    IsDelivered = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_messages_conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "conversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_messages_users_SenderId",
                        column: x => x.SenderId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_property_inquiries_BuyerId_IsDeleted",
                table: "property_inquiries",
                columns: new[] { "BuyerId", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_property_inquiries_PropertyId_IsDeleted",
                table: "property_inquiries",
                columns: new[] { "PropertyId", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_appointments_BuyerId_PropertyId_Status",
                table: "appointments",
                columns: new[] { "BuyerId", "PropertyId", "Status" },
                unique: true,
                filter: "\"Status\" = 0");

            migrationBuilder.CreateIndex(
                name: "IX_appointments_PropertyId",
                table: "appointments",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_conversations_BuyerId_PropertyId",
                table: "conversations",
                columns: new[] { "BuyerId", "PropertyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_conversations_PropertyId",
                table: "conversations",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_conversations_SellerId",
                table: "conversations",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_messages_ConversationId",
                table: "messages",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_messages_SenderId",
                table: "messages",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_notifications_RecipientId",
                table: "notifications",
                column: "RecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_offers_BuyerId_PropertyId_Status",
                table: "offers",
                columns: new[] { "BuyerId", "PropertyId", "Status" },
                unique: true,
                filter: "\"Status\" = 0");

            migrationBuilder.CreateIndex(
                name: "IX_offers_PropertyId",
                table: "offers",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_BuyerId",
                table: "reviews",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_PropertyId",
                table: "reviews",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_SellerId",
                table: "reviews",
                column: "SellerId");

            migrationBuilder.AddForeignKey(
                name: "FK_property_inquiries_properties_PropertyId",
                table: "property_inquiries",
                column: "PropertyId",
                principalTable: "properties",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_property_inquiries_users_BuyerId",
                table: "property_inquiries",
                column: "BuyerId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_property_inquiries_properties_PropertyId",
                table: "property_inquiries");

            migrationBuilder.DropForeignKey(
                name: "FK_property_inquiries_users_BuyerId",
                table: "property_inquiries");

            migrationBuilder.DropTable(
                name: "appointments");

            migrationBuilder.DropTable(
                name: "messages");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "offers");

            migrationBuilder.DropTable(
                name: "reviews");

            migrationBuilder.DropTable(
                name: "conversations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_property_inquiries",
                table: "property_inquiries");

            migrationBuilder.DropIndex(
                name: "IX_property_inquiries_BuyerId_IsDeleted",
                table: "property_inquiries");

            migrationBuilder.DropIndex(
                name: "IX_property_inquiries_PropertyId_IsDeleted",
                table: "property_inquiries");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "property_inquiries");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "property_inquiries");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "property_inquiries");

            migrationBuilder.DropColumn(
                name: "PreferredContactMethod",
                table: "property_inquiries");

            migrationBuilder.DropColumn(
                name: "PreferredContactTime",
                table: "property_inquiries");

            migrationBuilder.DropColumn(
                name: "ReplyMessage",
                table: "property_inquiries");

            migrationBuilder.DropColumn(
                name: "Subject",
                table: "property_inquiries");

            migrationBuilder.RenameTable(
                name: "property_inquiries",
                newName: "PropertyInquiries");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PropertyInquiries",
                table: "PropertyInquiries",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_PropertyInquiries_BuyerId",
                table: "PropertyInquiries",
                column: "BuyerId");

            migrationBuilder.AddForeignKey(
                name: "FK_PropertyInquiries_users_BuyerId",
                table: "PropertyInquiries",
                column: "BuyerId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
