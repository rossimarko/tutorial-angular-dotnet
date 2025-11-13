using System.ComponentModel.DataAnnotations;

namespace ProjectTracker.API.Models.Dtos.Auth;

/// <summary>
/// Request model for user registration
/// </summary>
public class RegisterRequest
{
    /// <summary>
    /// User email address
    /// </summary>
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    /// <summary>
    /// User password (minimum 6 characters)
    /// </summary>
    [Required]
    [MinLength(6)]
    public required string Password { get; set; }

    /// <summary>
    /// User first name
    /// </summary>
    [Required]
    public required string FirstName { get; set; }

    /// <summary>
    /// User last name
    /// </summary>
    [Required]
    public required string LastName { get; set; }
}
