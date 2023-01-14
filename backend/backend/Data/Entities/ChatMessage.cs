using System.ComponentModel.DataAnnotations;

namespace backend.Data.Entities;

public class ChatMessage : BaseEntity
{
    public int Id { get; set; }

    [Required] public string Message { get; set; }

    [Required] public string FromId { get; set; }
    [Required] public string ToId { get; set; }
}