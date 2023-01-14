using System.ComponentModel.DataAnnotations;

namespace backend.Data.Entities.Owned;

public class ItemTagField
{
    [Required] public string Name { get; set; }

    [Required] public string Value { get; set; }
}