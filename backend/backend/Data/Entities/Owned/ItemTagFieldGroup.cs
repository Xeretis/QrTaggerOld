using System.ComponentModel.DataAnnotations;

namespace backend.Data.Entities.Owned;

public class ItemTagFieldGroup
{
    [Required] public string Language { get; set; }

    [Required] [MinLength(1)] public List<ItemTagField> Fields { get; set; }
}