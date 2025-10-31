using System.ComponentModel.DataAnnotations;

namespace ProjectTracker.API.Models.Requests;

public class RefreshTokenRequest
{
    [Required]
    public required string RefreshToken { get; set; }
}
