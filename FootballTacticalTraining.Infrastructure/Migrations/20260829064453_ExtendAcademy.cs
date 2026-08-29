using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FootballTacticalTraining.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ExtendAcademy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminNotes",
                table: "Academies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AgeGroups",
                table: "Academies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedById",
                table: "Academies",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Facilities",
                table: "Academies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FoundedYear",
                table: "Academies",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Instagram",
                table: "Academies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Academies",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxAge",
                table: "Academies",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinAge",
                table: "Academies",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MonthlyFee",
                table: "Academies",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PlayingStyle",
                table: "Academies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Province",
                table: "Academies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "Academies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Academies",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Telegram",
                table: "Academies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Website",
                table: "Academies",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminNotes",
                table: "Academies");

            migrationBuilder.DropColumn(
                name: "AgeGroups",
                table: "Academies");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Academies");

            migrationBuilder.DropColumn(
                name: "Facilities",
                table: "Academies");

            migrationBuilder.DropColumn(
                name: "FoundedYear",
                table: "Academies");

            migrationBuilder.DropColumn(
                name: "Instagram",
                table: "Academies");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Academies");

            migrationBuilder.DropColumn(
                name: "MaxAge",
                table: "Academies");

            migrationBuilder.DropColumn(
                name: "MinAge",
                table: "Academies");

            migrationBuilder.DropColumn(
                name: "MonthlyFee",
                table: "Academies");

            migrationBuilder.DropColumn(
                name: "PlayingStyle",
                table: "Academies");

            migrationBuilder.DropColumn(
                name: "Province",
                table: "Academies");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "Academies");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Academies");

            migrationBuilder.DropColumn(
                name: "Telegram",
                table: "Academies");

            migrationBuilder.DropColumn(
                name: "Website",
                table: "Academies");
        }
    }
}
