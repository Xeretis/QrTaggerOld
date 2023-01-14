using System.ComponentModel.DataAnnotations;

namespace backend.Models.Requests;

public class RegisterRequest : IValidatableObject
{
    [Required] public string Email { get; set; }
    [Required] public string UserName { get; set; }
    [Required] public string Password { get; set; }
    [Required] public string ConfirmPassword { get; set; }


    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Password != ConfirmPassword)
        {
            yield return new ValidationResult("Passwords do not match", new[] { nameof(Password), nameof(ConfirmPassword) });
        }
    }
}