using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedChatMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TagId",
                table: "ChatMessages",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_TagId",
                table: "ChatMessages",
                column: "TagId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_ItemTags_TagId",
                table: "ChatMessages",
                column: "TagId",
                principalTable: "ItemTags",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_ItemTags_TagId",
                table: "ChatMessages");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessages_TagId",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "TagId",
                table: "ChatMessages");
        }
    }
}
