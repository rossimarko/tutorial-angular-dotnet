namespace ProjectTracker.API.Models.Entities;

/// <summary>
/// Refresh token for JWT authentication
/// </summary>
public class RefreshToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public required string Token { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public DateTime CreatedAt { get; set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt is not null;
    public bool IsValid => !IsExpired && !IsRevoked;
}
