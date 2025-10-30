namespace ProjectTracker.API.Models.Entities;

/// <summary>
/// Project entity
/// </summary>
public class Project
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = "Active";
    public int Priority { get; set; } = 1;
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation property (not mapped to DB, populated by repository)
    public User? User { get; set; }
}
