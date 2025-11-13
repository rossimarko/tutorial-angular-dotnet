using System.ComponentModel.DataAnnotations;

namespace ProjectTracker.API.Models.Dtos.Auth;

/// <summary>
/// Request model for user login
/// </summary>
public class LoginRequest
{
    /// <summary>
    /// User email address
    /// </summary>
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    /// <summary>
    /// User password
    /// </summary>
    [Required]
    public required string Password { get; set; }
}
