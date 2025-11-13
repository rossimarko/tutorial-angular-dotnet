namespace ProjectTracker.API.Models.Dtos.Auth;

/// <summary>
/// Response model for user information
/// </summary>
public class UserResponse
{
    /// <summary>
    /// Unique user identifier
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// User email address
    /// </summary>
    public required string Email { get; set; }

    /// <summary>
    /// User first name
    /// </summary>
    public string? FirstName { get; set; }

    /// <summary>
    /// User last name
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// Combined full name of the user
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Indicates if user account is active
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// User account creation timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; }
}
