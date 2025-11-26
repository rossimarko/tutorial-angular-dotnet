using Microsoft.Data.SqlClient;
using StackExchange.Profiling;
using StackExchange.Profiling.Data;
using System.Data;

namespace ProjectTracker.API.Data;

/// <summary>
/// Helper for creating database connections.
/// Wraps connections with MiniProfiler's ProfiledDbConnection for SQL query profiling.
/// </summary>
public class DbConnection
{
    private readonly string _connectionString;

    public DbConnection(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not found");
    }

    /// <summary>
    /// Create and open a new database connection.
    /// Returns a ProfiledDbConnection wrapping SqlConnection for MiniProfiler SQL tracking.
    /// </summary>
    public IDbConnection CreateConnection()
    {
        var connection = new SqlConnection(_connectionString);
        return new ProfiledDbConnection(connection, MiniProfiler.Current);
    }

    /// <summary>
    /// Create and open a new database connection asynchronously.
    /// Returns a ProfiledDbConnection wrapping SqlConnection for MiniProfiler SQL tracking.
    /// </summary>
    public async Task<IDbConnection> CreateConnectionAsync()
    {
        var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return new ProfiledDbConnection(connection, MiniProfiler.Current);
    }
}
