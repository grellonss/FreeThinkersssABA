using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CulturalGuideBACKEND.Migrations
{
    /// <inheritdoc />
    public partial class AddCardItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CardItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EntityId = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    EntityName = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    ImagePath = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    BadgeText = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    Address = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Classification = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: true),
                    MunicipalityName = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    MunicipalityLogoPath = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Language = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true),
                    Municipality = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CardItems", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CardItems_Lookup",
                table: "CardItems",
                columns: new[] { "EntityId", "Language", "Municipality" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CardItems");
        }
    }
}
