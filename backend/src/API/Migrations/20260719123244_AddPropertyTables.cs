using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealEstate.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPropertyTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "properties",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ShortDescription = table.Column<string>(type: "text", nullable: true),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    ListingType = table.Column<int>(type: "integer", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    PropertyTypeId = table.Column<Guid>(type: "uuid", nullable: true),
                    StatusId = table.Column<Guid>(type: "uuid", nullable: true),
                    ConditionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Bedrooms = table.Column<int>(type: "integer", nullable: true),
                    Bathrooms = table.Column<int>(type: "integer", nullable: true),
                    Balconies = table.Column<int>(type: "integer", nullable: true),
                    Floors = table.Column<int>(type: "integer", nullable: true),
                    Parking = table.Column<int>(type: "integer", nullable: true),
                    Area = table.Column<decimal>(type: "numeric", nullable: true),
                    AreaUnit = table.Column<string>(type: "text", nullable: true),
                    LotSize = table.Column<decimal>(type: "numeric", nullable: true),
                    FurnishedStatus = table.Column<string>(type: "text", nullable: true),
                    YearBuilt = table.Column<int>(type: "integer", nullable: true),
                    FacingDirection = table.Column<string>(type: "text", nullable: true),
                    CountryId = table.Column<Guid>(type: "uuid", nullable: true),
                    StateId = table.Column<Guid>(type: "uuid", nullable: true),
                    CityId = table.Column<Guid>(type: "uuid", nullable: true),
                    AreaText = table.Column<string>(type: "text", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    Landmark = table.Column<string>(type: "text", nullable: true),
                    ZipCode = table.Column<string>(type: "text", nullable: true),
                    Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Longitude = table.Column<double>(type: "double precision", nullable: true),
                    Slug = table.Column<string>(type: "text", nullable: true),
                    MetaTitle = table.Column<string>(type: "text", nullable: true),
                    MetaDescription = table.Column<string>(type: "text", nullable: true),
                    MetaKeywords = table.Column<string>(type: "text", nullable: true),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: false),
                    PublishStatus = table.Column<int>(type: "integer", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_properties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_properties_cities_CityId",
                        column: x => x.CityId,
                        principalTable: "cities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_properties_countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_properties_property_categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "property_categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_properties_property_conditions_ConditionId",
                        column: x => x.ConditionId,
                        principalTable: "property_conditions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_properties_property_statuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "property_statuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_properties_property_types_PropertyTypeId",
                        column: x => x.PropertyTypeId,
                        principalTable: "property_types",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_properties_states_StateId",
                        column: x => x.StateId,
                        principalTable: "states",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_properties_users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AmenityProperty",
                columns: table => new
                {
                    AmenitiesId = table.Column<Guid>(type: "uuid", nullable: false),
                    PropertyId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AmenityProperty", x => new { x.AmenitiesId, x.PropertyId });
                    table.ForeignKey(
                        name: "FK_AmenityProperty_amenities_AmenitiesId",
                        column: x => x.AmenitiesId,
                        principalTable: "amenities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AmenityProperty_properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "property_audit_logs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PropertyId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    OldStatus = table.Column<int>(type: "integer", nullable: false),
                    NewStatus = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_property_audit_logs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_property_audit_logs_properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_property_audit_logs_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "property_documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PropertyId = table.Column<Guid>(type: "uuid", nullable: false),
                    FilePath = table.Column<string>(type: "text", nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_property_documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_property_documents_properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "property_floor_plans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PropertyId = table.Column<Guid>(type: "uuid", nullable: false),
                    FilePath = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Dimensions = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_property_floor_plans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_property_floor_plans_properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "property_media",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PropertyId = table.Column<Guid>(type: "uuid", nullable: false),
                    FilePath = table.Column<string>(type: "text", nullable: false),
                    FileType = table.Column<string>(type: "text", nullable: false),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_property_media", x => x.Id);
                    table.ForeignKey(
                        name: "FK_property_media_properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AmenityProperty_PropertyId",
                table: "AmenityProperty",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_properties_CategoryId",
                table: "properties",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_properties_CityId",
                table: "properties",
                column: "CityId");

            migrationBuilder.CreateIndex(
                name: "IX_properties_ConditionId",
                table: "properties",
                column: "ConditionId");

            migrationBuilder.CreateIndex(
                name: "IX_properties_CountryId",
                table: "properties",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_properties_OwnerId",
                table: "properties",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_properties_PropertyTypeId",
                table: "properties",
                column: "PropertyTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_properties_Slug",
                table: "properties",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_properties_StateId",
                table: "properties",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_properties_StatusId",
                table: "properties",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_property_audit_logs_PropertyId",
                table: "property_audit_logs",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_property_audit_logs_UserId",
                table: "property_audit_logs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_property_documents_PropertyId",
                table: "property_documents",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_property_floor_plans_PropertyId",
                table: "property_floor_plans",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_property_media_PropertyId",
                table: "property_media",
                column: "PropertyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AmenityProperty");

            migrationBuilder.DropTable(
                name: "property_audit_logs");

            migrationBuilder.DropTable(
                name: "property_documents");

            migrationBuilder.DropTable(
                name: "property_floor_plans");

            migrationBuilder.DropTable(
                name: "property_media");

            migrationBuilder.DropTable(
                name: "properties");
        }
    }
}
