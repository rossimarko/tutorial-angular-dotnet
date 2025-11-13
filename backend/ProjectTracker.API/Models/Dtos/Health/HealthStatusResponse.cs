namespace ProjectTracker.API.Models.Dtos.Health;

/// <summary>
/// Response model for basic health check endpoint
/// </summary>
public class HealthStatusResponse
{
    /// <summary>
    /// Health status (Healthy/Unhealthy)
    /// </summary>
    public required string Status { get; set; }

    /// <summary>
    /// Current UTC timestamp
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Current environment name
    /// </summary>
    public required string Environment { get; set; }
}
