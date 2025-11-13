namespace ProjectTracker.API.Models.Dtos.Health;

/// <summary>
/// Response model for database health check endpoint
/// </summary>
public class DatabaseHealthResponse
{
    /// <summary>
    /// Health status (Healthy/Unhealthy)
    /// </summary>
    public required string Status { get; set; }

    /// <summary>
    /// Database connection status
    /// </summary>
    public required string Database { get; set; }

    /// <summary>
    /// Total count of users in database
    /// </summary>
    public int UserCount { get; set; }

    /// <summary>
    /// Current UTC timestamp
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Error message if health check failed
    /// </summary>
    public string? Error { get; set; }
}
