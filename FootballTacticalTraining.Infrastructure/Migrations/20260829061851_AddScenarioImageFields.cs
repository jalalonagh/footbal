using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FootballTacticalTraining.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddScenarioImageFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Scenarios",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceImageBase64",
                table: "Scenarios",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Scenarios");

            migrationBuilder.DropColumn(
                name: "SourceImageBase64",
                table: "Scenarios");
        }
    }
}
