using Dapper;
using ProjectTracker.API.Models.Common;
using ProjectTracker.API.Models.Entities;
using System.Data;
using System.Text;

namespace ProjectTracker.API.Data.Repositories;

/// <summary>
/// Dapper-based implementation of IProjectRepository
/// </summary>
public class ProjectRepository : IProjectRepository
{
    private readonly DbConnection _dbConnection;
    private readonly ILogger<ProjectRepository> _logger;

    public ProjectRepository(DbConnection dbConnection, ILogger<ProjectRepository> logger)
    {
        _dbConnection = dbConnection;
        _logger = logger;
    }

    public async Task<Project?> GetByIdAsync(int id)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = @"
                SELECT [Id], [UserId], [Title], [Description], [Status], [Priority],
                       [StartDate], [DueDate], [CreatedAt], [UpdatedAt]
                FROM [Projects]
                WHERE [Id] = @Id";

            var project = await connection.QueryFirstOrDefaultAsync<Project>(
                sql,
                new { Id = id });

            return project;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving project {ProjectId}", id);
            throw;
        }
    }

    public async Task<IEnumerable<Project>> GetByUserIdAsync(int userId)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = @"
                SELECT [Id], [UserId], [Title], [Description], [Status], [Priority],
                       [StartDate], [DueDate], [CreatedAt], [UpdatedAt]
                FROM [Projects]
                WHERE [UserId] = @UserId
                ORDER BY [CreatedAt] DESC";

            var projects = await connection.QueryAsync<Project>(
                sql,
                new { UserId = userId });

            return projects;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving projects for user {UserId}", userId);
            throw;
        }
    }

    public async Task<(IEnumerable<Project> items, int total)> GetPagedAsync(
        int userId,
        PaginationRequest request)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            // Build WHERE clause
            var whereClause = new StringBuilder("WHERE [UserId] = @UserId");
            var parameters = new DynamicParameters();
            parameters.Add("@UserId", userId);

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                whereClause.Append(" AND ([Title] LIKE @SearchTerm OR [Description] LIKE @SearchTerm)");
                parameters.Add("@SearchTerm", $"%{request.SearchTerm}%");
            }

            // Get total count
            var countSql = $"SELECT COUNT(*) FROM [Projects] {whereClause}";
            var total = await connection.QuerySingleAsync<int>(countSql, parameters);

            // Get paged data
            var offset = (request.PageNumber - 1) * request.PageSize;
            var sortColumn = GetSafeSortColumn(request.SortBy);
            var sortDirection = request.SortDirection.ToLower() == "desc" ? "DESC" : "ASC";

            var sql = $@"
                SELECT [Id], [UserId], [Title], [Description], [Status], [Priority],
                       [StartDate], [DueDate], [CreatedAt], [UpdatedAt]
                FROM [Projects]
                {whereClause}
                ORDER BY [{sortColumn}] {sortDirection}
                OFFSET @Offset ROWS
                FETCH NEXT @PageSize ROWS ONLY";

            parameters.Add("@Offset", offset);
            parameters.Add("@PageSize", request.PageSize);

            var projects = await connection.QueryAsync<Project>(sql, parameters);

            return (projects, total);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving paged projects for user {UserId}", userId);
            throw;
        }
    }

    public async Task<(IEnumerable<Project> items, int total)> GetInfiniteScrollAsync(
        int userId,
        int skip,
        int take)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            // Get total count
            var countSql = "SELECT COUNT(*) FROM [Projects] WHERE [UserId] = @UserId";
            var total = await connection.QuerySingleAsync<int>(
                countSql,
                new { UserId = userId });

            // Get projects (take one extra to determine if there are more)
            var sql = @"
                SELECT [Id], [UserId], [Title], [Description], [Status], [Priority],
                       [StartDate], [DueDate], [CreatedAt], [UpdatedAt]
                FROM [Projects]
                WHERE [UserId] = @UserId
                ORDER BY [CreatedAt] DESC
                OFFSET @Skip ROWS
                FETCH NEXT @Take ROWS ONLY";

            var projects = await connection.QueryAsync<Project>(
                sql,
                new { UserId = userId, Skip = skip, Take = take });

            return (projects, total);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving infinite scroll projects for user {UserId}", userId);
            throw;
        }
    }

    public async Task<int> CreateAsync(Project project)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = @"
                INSERT INTO [Projects] ([UserId], [Title], [Description], [Status], [Priority], [StartDate], [DueDate])
                VALUES (@UserId, @Title, @Description, @Status, @Priority, @StartDate, @DueDate);
                SELECT CAST(SCOPE_IDENTITY() as int)";

            var id = await connection.QuerySingleAsync<int>(
                sql,
                new
                {
                    project.UserId,
                    project.Title,
                    project.Description,
                    project.Status,
                    project.Priority,
                    project.StartDate,
                    project.DueDate
                });

            _logger.LogInformation("Project created with id {ProjectId}", id);
            return id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating project");
            throw;
        }
    }

    public async Task<bool> UpdateAsync(Project project)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = @"
                UPDATE [Projects]
                SET [Title] = @Title,
                    [Description] = @Description,
                    [Status] = @Status,
                    [Priority] = @Priority,
                    [StartDate] = @StartDate,
                    [DueDate] = @DueDate,
                    [UpdatedAt] = GETUTCDATE()
                WHERE [Id] = @Id AND [UserId] = @UserId";

            var rowsAffected = await connection.ExecuteAsync(
                sql,
                new
                {
                    project.Id,
                    project.UserId,
                    project.Title,
                    project.Description,
                    project.Status,
                    project.Priority,
                    project.StartDate,
                    project.DueDate
                });

            _logger.LogInformation("Project {ProjectId} updated", project.Id);
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating project {ProjectId}", project.Id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = "DELETE FROM [Projects] WHERE [Id] = @Id";

            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });

            _logger.LogInformation("Project {ProjectId} deleted", id);
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting project {ProjectId}", id);
            throw;
        }
    }

    public async Task<IEnumerable<Project>> SearchAsync(int userId, string searchTerm)
    {
        try
        {
            using var connection = await _dbConnection.CreateConnectionAsync();

            var sql = @"
                SELECT [Id], [UserId], [Title], [Description], [Status], [Priority],
                       [StartDate], [DueDate], [CreatedAt], [UpdatedAt]
                FROM [Projects]
                WHERE [UserId] = @UserId
                  AND ([Title] LIKE @SearchTerm OR [Description] LIKE @SearchTerm)
                ORDER BY [CreatedAt] DESC";

            var projects = await connection.QueryAsync<Project>(
                sql,
                new { UserId = userId, SearchTerm = $"%{searchTerm}%" });

            return projects;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching projects for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Prevent SQL injection by validating sort column names
    /// </summary>
    private static string GetSafeSortColumn(string? sortBy)
    {
        return sortBy?.ToLower() switch
        {
            "title" => "Title",
            "status" => "Status",
            "priority" => "Priority",
            "duedate" => "DueDate",
            "createdat" => "CreatedAt",
            _ => "CreatedAt" // Default
        };
    }
}
