using ProjectTracker.API.Models.Common;
using ProjectTracker.API.Models.Entities;

namespace ProjectTracker.API.Data.Repositories;

/// <summary>
/// Repository interface for Project operations
/// </summary>
public interface IProjectRepository
{
    Task<Project?> GetByIdAsync(int id);
    Task<IEnumerable<Project>> GetByUserIdAsync(int userId);
    Task<(IEnumerable<Project> items, int total)> GetPagedAsync(int userId, PaginationRequest request);
    Task<(IEnumerable<Project> items, int total)> GetInfiniteScrollAsync(int userId, int skip, int take);
    Task<int> CreateAsync(Project project);
    Task<bool> UpdateAsync(Project project);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<Project>> SearchAsync(int userId, string searchTerm);
}
