using ProjectTracker.API.Models.Entities;

namespace ProjectTracker.API.Data.Repositories;

/// <summary>
/// Repository interface for User operations
/// </summary>
public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetAllAsync();
    Task<int> CreateAsync(User user);
    Task<bool> UpdateAsync(User user);
    Task<bool> DeleteAsync(int id);
    Task<bool> EmailExistsAsync(string email);
}
