using System.ComponentModel.DataAnnotations;
using backend.Data.Entities.Owned;

namespace backend.Models.Requests;

public class UpdateItemTagRequest
{
    [Required] [MaxLength(256)] public string Name { get; set; }
    [Required] [MaxLength(2024)] public string Description { get; set; }
    [Required] public ItemTagFieldGroup[] FieldGroups { get; set; }
}