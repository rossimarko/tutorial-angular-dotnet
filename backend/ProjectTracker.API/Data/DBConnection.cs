using Microsoft.Data.SqlClient;
using System.Data;

namespace ProjectTracker.API.Data;

/// <summary>
/// Helper for creating database connections
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
    /// Create and open a new database connection
    /// </summary>
    public IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    /// <summary>
    /// Create and open a new database connection asynchronously
    /// </summary>
    public async Task<IDbConnection> CreateConnectionAsync()
    {
        var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return connection;
    }
}
