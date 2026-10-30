using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CulturalGuideBACKEND.Migrations
{
    /// <inheritdoc />
    public partial class UpdateModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS ""CardItemDetails"" (
                    ""Id"" INTEGER NOT NULL CONSTRAINT ""PK_CardItemDetails"" PRIMARY KEY AUTOINCREMENT,
                    ""EntityId"" TEXT NOT NULL,
                    ""Category"" TEXT NOT NULL,
                    ""Language"" TEXT NOT NULL,
                    ""Municipality"" TEXT NOT NULL,
                    ""Title"" TEXT NULL,
                    ""Description"" TEXT NULL,
                    ""Address"" TEXT NULL,
                    ""PrimaryImage"" TEXT NULL,
                    ""Latitude"" REAL NULL,
                    ""Longitude"" REAL NULL,
                    ""JsonPayload"" TEXT NOT NULL,
                    ""CreatedAt"" TEXT NOT NULL
                );
            ");

            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS ""CardItems"" (
                    ""Id"" INTEGER NOT NULL CONSTRAINT ""PK_CardItems"" PRIMARY KEY AUTOINCREMENT,
                    ""EntityId"" TEXT NULL,
                    ""EntityName"" TEXT NULL,
                    ""ImagePath"" TEXT NULL,
                    ""BadgeText"" TEXT NULL,
                    ""Address"" TEXT NULL,
                    ""Classification"" TEXT NULL,
                    ""Date"" TEXT NULL,
                    ""MunicipalityName"" TEXT NULL,
                    ""MunicipalityLogoPath"" TEXT NULL,
                    ""Language"" TEXT NULL,
                    ""Municipality"" TEXT NULL,
                    ""CreatedAt"" TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
                );
            ");

            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS ""EatAndDrink"" (
                    ""Id"" INTEGER NOT NULL CONSTRAINT ""PK_EatAndDrink"" PRIMARY KEY AUTOINCREMENT,
                    ""EntityName"" TEXT NOT NULL,
                    ""ImagePath"" TEXT NOT NULL,
                    ""BadgeText"" TEXT NOT NULL,
                    ""Address"" TEXT NOT NULL
                );
            ");

            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS ""ProfileVector"" (
                    ""Id"" INTEGER NOT NULL CONSTRAINT ""PK_ProfileVector"" PRIMARY KEY AUTOINCREMENT,
                    ""UserId"" TEXT NOT NULL,
                    ""Municipality"" TEXT NOT NULL,
                    ""StartTime"" TEXT NOT NULL,
                    ""EndTime"" TEXT NOT NULL,
                    ""SelectedCategories"" TEXT NOT NULL,
                    ""CreatedAt"" TEXT NOT NULL,
                    ""UpdatedAt"" TEXT NOT NULL
                );
            ");

            migrationBuilder.Sql(@"
                CREATE UNIQUE INDEX IF NOT EXISTS ""IX_CardItems_Lookup""
                ON ""CardItems"" (""EntityId"", ""Language"", ""Municipality"");
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CardItemDetails");

            migrationBuilder.DropTable(
                name: "CardItems");

            migrationBuilder.DropTable(
                name: "EatAndDrink");

            migrationBuilder.DropTable(
                name: "ProfileVector");
        }
    }
}
