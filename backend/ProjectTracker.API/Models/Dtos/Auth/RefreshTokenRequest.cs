using System.ComponentModel.DataAnnotations;

namespace ProjectTracker.API.Models.Dtos.Auth;

/// <summary>
/// Request model for token refresh
/// </summary>
public class RefreshTokenRequest
{
    /// <summary>
    /// Refresh token for obtaining a new access token
    /// </summary>
    [Required]
    public required string RefreshToken { get; set; }
}
