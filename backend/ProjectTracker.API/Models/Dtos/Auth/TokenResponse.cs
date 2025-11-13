namespace ProjectTracker.API.Models.Dtos.Auth;

/// <summary>
/// Response model for successful authentication
/// </summary>
public class TokenResponse
{
    /// <summary>
    /// JWT access token for API authentication
    /// </summary>
    public required string AccessToken { get; set; }

    /// <summary>
    /// Refresh token for obtaining a new access token
    /// </summary>
    public required string RefreshToken { get; set; }

    /// <summary>
    /// Token authentication type (always "Bearer")
    /// </summary>
    public required string TokenType { get; set; } = "Bearer";

    /// <summary>
    /// Access token expiration time in seconds
    /// </summary>
    public int ExpiresIn { get; set; }
}
