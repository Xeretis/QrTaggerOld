using System.ComponentModel.DataAnnotations;

namespace backend.Models.Requests;

public class ShareLocationRequest
{
    [Required] public string Latitude { get; set; }
    [Required] public string Longitude { get; set; }
}