using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using backend.Data.Entities.Owned;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedItemTags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<IEnumerable<ItemTagFieldGroup>>(
                name: "FieldGroups",
                table: "ItemTags",
                type: "jsonb",
                nullable: false);

            migrationBuilder.CreateIndex(
                name: "IX_ItemTags_Token",
                table: "ItemTags",
                column: "Token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ItemTags_Token",
                table: "ItemTags");

            migrationBuilder.DropColumn(
                name: "FieldGroups",
                table: "ItemTags");
        }
    }
}
