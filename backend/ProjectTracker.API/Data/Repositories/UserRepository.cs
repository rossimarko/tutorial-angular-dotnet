using Dapper;
using ProjectTracker.API.Models.Entities;
using System.Data;

namespace ProjectTracker.API.Data.Repositories;

/// <summary>
/// Dapper-based implementation of IUserRepository
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly DbConnection _dbConnection;
    private readonly ILogger<UserRepository> _logger;

    public UserRepository(DbConnection dbConnection, ILogger<UserRepository> logger)
    {
        _dbConnection = dbConnection;
        _logger = logger;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = @"
                SELECT [Id], [Email], [PasswordHash], [FirstName], [LastName], 
                       [IsActive], [CreatedAt], [UpdatedAt]
                FROM [Users]
                WHERE [Id] = @Id";

            var user = await connection.QueryFirstOrDefaultAsync<User>(
                sql,
                new { Id = id });

            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user by id {UserId}", id);
            throw;
        }
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = @"
                SELECT [Id], [Email], [PasswordHash], [FirstName], [LastName],
                       [IsActive], [CreatedAt], [UpdatedAt]
                FROM [Users]
                WHERE [Email] = @Email";

            var user = await connection.QueryFirstOrDefaultAsync<User>(
                sql,
                new { Email = email });

            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user by email {Email}", email);
            throw;
        }
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = @"
                SELECT [Id], [Email], [PasswordHash], [FirstName], [LastName],
                       [IsActive], [CreatedAt], [UpdatedAt]
                FROM [Users]
                ORDER BY [CreatedAt] DESC";

            var users = await connection.QueryAsync<User>(sql);
            return users;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all users");
            throw;
        }
    }

    public async Task<int> CreateAsync(User user)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = @"
                INSERT INTO [Users] ([Email], [PasswordHash], [FirstName], [LastName], [IsActive])
                VALUES (@Email, @PasswordHash, @FirstName, @LastName, @IsActive);
                SELECT CAST(SCOPE_IDENTITY() as int)";

            var id = await connection.QuerySingleAsync<int>(
                sql,
                new
                {
                    user.Email,
                    user.PasswordHash,
                    user.FirstName,
                    user.LastName,
                    user.IsActive
                });

            _logger.LogInformation("User created with id {UserId}", id);
            return id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user with email {Email}", user.Email);
            throw;
        }
    }

    public async Task<bool> UpdateAsync(User user)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = @"
                UPDATE [Users]
                SET [Email] = @Email,
                    [FirstName] = @FirstName,
                    [LastName] = @LastName,
                    [IsActive] = @IsActive,
                    [UpdatedAt] = GETUTCDATE()
                WHERE [Id] = @Id";

            var rowsAffected = await connection.ExecuteAsync(
                sql,
                new
                {
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.IsActive
                });

            _logger.LogInformation("User {UserId} updated", user.Id);
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", user.Id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = "DELETE FROM [Users] WHERE [Id] = @Id";

            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });

            _logger.LogInformation("User {UserId} deleted", id);
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            throw;
        }
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = "SELECT COUNT(*) FROM [Users] WHERE [Email] = @Email";

            var count = await connection.QuerySingleAsync<int>(
                sql,
                new { Email = email });

            return count > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if email exists {Email}", email);
            throw;
        }
    }

    public async Task SaveRefreshTokenAsync(RefreshToken refreshToken)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = @"
                INSERT INTO [RefreshTokens] ([UserId], [Token], [ExpiresAt], [CreatedAt], [RevokedAt], [IsRevoked])
                VALUES (@UserId, @Token, @ExpiresAt, @CreatedAt, NULL, 0)";

            await connection.ExecuteAsync(
                sql,
                new
                {
                    refreshToken.UserId,
                    refreshToken.Token,
                    refreshToken.ExpiresAt,
                    refreshToken.CreatedAt
                });

            _logger.LogInformation("Refresh token saved for user {UserId}", refreshToken.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving refresh token for user {UserId}", refreshToken.UserId);
            throw;
        }
    }

    public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = @"
                SELECT [Id], [UserId], [Token], [ExpiresAt], [CreatedAt], [RevokedAt], [IsRevoked]
                FROM [RefreshTokens]
                WHERE [Token] = @Token";

            var refreshToken = await connection.QueryFirstOrDefaultAsync<RefreshToken>(
                sql,
                new { Token = token });

            return refreshToken;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving refresh token");
            throw;
        }
    }

    public async Task<bool> RevokeRefreshTokenAsync(string token)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = @"
                UPDATE [RefreshTokens]
                SET [IsRevoked] = 1, [RevokedAt] = GETUTCDATE()
                WHERE [Token] = @Token";

            var rowsAffected = await connection.ExecuteAsync(sql, new { Token = token });

            _logger.LogInformation("Refresh token revoked");
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking refresh token");
            throw;
        }
    }

    public async Task<bool> RevokeAllRefreshTokensAsync(int userId)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = @"
                UPDATE [RefreshTokens]
                SET [IsRevoked] = 1, [RevokedAt] = GETUTCDATE()
                WHERE [UserId] = @UserId AND [IsRevoked] = 0";

            var rowsAffected = await connection.ExecuteAsync(sql, new { UserId = userId });

            _logger.LogInformation("All refresh tokens revoked for user {UserId}", userId);
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking all refresh tokens for user {UserId}", userId);
            throw;
        }
    }
}