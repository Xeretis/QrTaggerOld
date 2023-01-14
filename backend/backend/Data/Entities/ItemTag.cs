using System.ComponentModel.DataAnnotations;

namespace backend.Data.Entities;

public class ItemTag : BaseEntity
{
    [Key] public int Id { get; set; }

    [Required] [MaxLength(256)] public string Name { get; set; }
    [Required] [MaxLength(2024)] public string Description { get; set; }

    [Required] public string Token { get; set; }

    public string OwnerId { get; set; }
    public ApiUser Owner { get; set; }
}