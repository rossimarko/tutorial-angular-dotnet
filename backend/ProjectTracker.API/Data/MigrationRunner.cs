using System.Reflection;
using Dapper;
using System.Data;
using Microsoft.Data.SqlClient;

namespace ProjectTracker.API.Data;

/// <summary>
/// Runs SQL migrations from migration scripts
/// </summary>
public class MigrationRunner
{
    private readonly string _connectionString;
    private readonly ILogger<MigrationRunner> _logger;

    public MigrationRunner(string connectionString, ILogger<MigrationRunner> logger)
    {
        _connectionString = connectionString;
        _logger = logger;
    }

    /// <summary>
    /// Execute all migrations in order
    /// </summary>
    public async Task RunMigrationsAsync()
    {
        try
        {
            // Create migrations table if it doesn't exist
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                const string createMigrationsTableSql = @"
                    IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Migrations')
                    BEGIN
                        CREATE TABLE [Migrations] (
                            [Id] INT PRIMARY KEY IDENTITY(1,1),
                            [Version] NVARCHAR(100) NOT NULL UNIQUE,
                            [AppliedAt] DATETIME2 DEFAULT GETUTCDATE()
                        );
                    END";

                await connection.ExecuteAsync(createMigrationsTableSql);
            }

            // Get list of migration files
            var migrationPath = "D:\\Formazione\\tutorial-angular-dotnet\\backend\\ProjectTracker.API\\Data\\Migrations"; // Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "Migrations");

            if (!Directory.Exists(migrationPath))
            {
                _logger.LogWarning("Migrations directory not found at {Path}", migrationPath);
                return;
            }

            var migrationFiles = Directory.GetFiles(migrationPath, "*.sql")
                .OrderBy(f => f)
                .ToList();

            foreach (var file in migrationFiles)
            {
                var fileName = Path.GetFileName(file);
                await RunMigrationAsync(fileName, file);
            }

            _logger.LogInformation("All migrations completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error running migrations: {Message}", ex.Message);
            throw;
        }
    }

    /// <summary>
    /// Run a single migration file
    /// </summary>
    private async Task RunMigrationAsync(string version, string filePath)
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            await connection.OpenAsync();

            // Check if migration already applied
            var alreadyApplied = await connection.QuerySingleOrDefaultAsync<int>(
                "SELECT COUNT(*) FROM Migrations WHERE Version = @Version",
                new { Version = version });

            if (alreadyApplied > 0)
            {
                _logger.LogInformation("Migration {Version} already applied, skipping", version);
                return;
            }

            try
            {
                // Read migration file
                var sql = await File.ReadAllTextAsync(filePath);

                // Execute migration
                await connection.ExecuteAsync(sql);

                // Record migration as applied
                await connection.ExecuteAsync(
                    "INSERT INTO Migrations (Version) VALUES (@Version)",
                    new { Version = version });

                _logger.LogInformation("Migration {Version} applied successfully", version);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying migration {Version}: {Message}", version, ex.Message);
                throw;
            }
        }
    }
}
