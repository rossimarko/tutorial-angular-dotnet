namespace ProjectTracker.API.Models.Entities;

/// <summary>
/// User entity representing a registered user
/// </summary>
public class User
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public string FullName => $"{FirstName} {LastName}".Trim();
}
