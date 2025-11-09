using ProjectTracker.API.Data;
using ProjectTracker.API.Middleware;

namespace ProjectTracker.API.Configuration;

/// <summary>
/// Extension methods for middleware pipeline configuration.
/// These methods organize the middleware setup for better readability and maintainability.
/// </summary>
public static class MiddlewareExtensions
{
    /// <summary>
    /// Configure the HTTP request middleware pipeline with proper ordering and environment-specific settings.
    /// Middleware order is critical: error handling → logging → security → routing → endpoints.
    /// </summary>
    public static WebApplication UseApplicationMiddleware(this WebApplication app)
    {
        // Development-only middleware
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(config =>
            {
                config.SwaggerEndpoint("/swagger/v1/swagger.json", "Project Tracker API v1");
            });
        }

        // Error handling and logging middleware (should be first)
        app.UseMiddleware<ErrorHandlingMiddleware>();
        app.UseMiddleware<RequestLoggingMiddleware>();
        app.UseMiddleware<LoggingMiddleware>();

        // Security middleware
        if (!app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }

        // CORS before routing
        app.UseCors("AllowAngularApp");

        // Response caching
        app.UseResponseCaching();

        // Authentication and authorization
        app.UseAuthentication();
        app.UseAuthorization();

        // Health check endpoint
        app.MapHealthChecks("/health");

        // Controller routes
        app.MapControllers();

        return app;
    }

    /// <summary>
    /// Run database migrations asynchronously.
    /// This must be called after building the app but before calling app.Run().
    /// </summary>
    public static async Task RunDatabaseMigrationsAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var logger = scope.ServiceProvider.GetRequiredService<ILogger<MigrationRunner>>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var connectionString = config.GetConnectionString("DefaultConnection");

        try
        {
            logger.LogInformation("Starting database migrations...");
            var migrationRunner = new MigrationRunner(connectionString!, logger);
            await migrationRunner.RunMigrationsAsync();
            logger.LogInformation("Database migrations completed successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Database migration failed: {Message}", ex.Message);
            throw;
        }
    }
}
