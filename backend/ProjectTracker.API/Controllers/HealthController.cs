using Microsoft.AspNetCore.Mvc;
using ProjectTracker.API.Data.Repositories;

namespace ProjectTracker.API.Controllers;

/// <summary>
/// Health check endpoint for monitoring API and database status
/// Similar to a simple GET endpoint in .NET Framework WebAPI
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;
    private readonly IUserRepository _userRepository;

    // Constructor injection - just like Unity/Ninject in .NET Framework
    public HealthController(ILogger<HealthController> logger, IUserRepository userRepository)
    {
        _logger = logger;
        _userRepository = userRepository;
    }

    /// <summary>
    /// Basic health check - verifies API is running
    /// GET: api/health
    /// </summary>
    /// <returns>Health status with timestamp</returns>
    [HttpGet]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public ActionResult<object> GetHealth()
    {
        _logger.LogInformation("Health check endpoint called");
        return Ok(new 
        { 
            status = "Healthy", 
            timestamp = DateTime.UtcNow,
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
        });
    }

    /// <summary>
    /// Database health check - verifies database connectivity
    /// GET: api/health/database
    /// </summary>
    /// <returns>Database health status</returns>
    [HttpGet("database")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<object>> GetDatabaseHealth()
    {
        try
        {
            // Try to query the database
            var users = await _userRepository.GetAllAsync();
            
            return Ok(new 
            { 
                status = "Healthy",
                database = "Connected",
                userCount = users.Count(),
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database health check failed");
            
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new 
            { 
                status = "Unhealthy",
                database = "Disconnected",
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }
}
