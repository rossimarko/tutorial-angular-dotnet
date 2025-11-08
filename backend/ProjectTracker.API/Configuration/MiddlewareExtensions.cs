using DbUp;
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
        app.UseMiddleware<LoggingMiddleware>();

        // Security middleware
        if (!app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }

        // CORS before routing
        app.UseCors("AllowAngularApp");

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
    /// Run database migrations using DbUp.
    /// This must be called after building the app but before calling app.Run().
    /// DbUp reads embedded SQL scripts from the Data/Migrations folder and executes them in order.
    /// </summary>
    public static async Task RunDatabaseMigrationsAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
            .CreateLogger("DbUpMigrations");
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var connectionString = config.GetConnectionString("DefaultConnection");

        if (string.IsNullOrEmpty(connectionString))
        {
            logger.LogError("Connection string 'DefaultConnection' is not configured");
            throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured");
        }

        try
        {
            logger.LogInformation("Starting database migrations with DbUp...");

            // Configure DbUp to use embedded SQL scripts
            var upgrader = DeployChanges.To
                .SqlDatabase(connectionString)
                .WithScriptsEmbeddedInAssembly(typeof(Program).Assembly, script =>
                    script.Contains("Data.Migrations"))
                .LogTo(new DbUpLogger(logger))
                .Build();

            // Check if upgrade is required
            if (!upgrader.IsUpgradeRequired())
            {
                logger.LogInformation("Database is already up to date. No migrations needed.");
                return;
            }

            // Perform the upgrade
            var result = upgrader.PerformUpgrade();

            if (!result.Successful)
            {
                logger.LogError(result.Error, "Database migration failed: {Message}", result.Error.Message);
                throw result.Error;
            }

            logger.LogInformation("Database migrations completed successfully");

            // Log which scripts were executed
            if (result.Scripts.Any())
            {
                logger.LogInformation("Executed {Count} migration script(s):", result.Scripts.Count());
                foreach (var script in result.Scripts)
                {
                    logger.LogInformation("  - {ScriptName}", script.Name);
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Database migration failed: {Message}", ex.Message);
            throw;
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// Custom DbUp logger that integrates with ILogger
    /// </summary>
    private class DbUpLogger : DbUp.Engine.Output.IUpgradeLog
    {
        private readonly ILogger _logger;

        public DbUpLogger(ILogger logger)
        {
            _logger = logger;
        }

        public void WriteInformation(string format, params object[] args)
        {
            _logger.LogInformation(format, args);
        }

        public void WriteError(string format, params object[] args)
        {
            _logger.LogError(format, args);
        }

        public void WriteWarning(string format, params object[] args)
        {
            _logger.LogWarning(format, args);
        }
    }
}
