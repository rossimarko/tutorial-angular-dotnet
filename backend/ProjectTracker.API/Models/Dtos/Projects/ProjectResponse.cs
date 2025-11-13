namespace ProjectTracker.API.Models.Dtos.Projects;

/// <summary>
/// Response model for project data
/// </summary>
public class ProjectResponse
{
    /// <summary>
    /// Unique project identifier
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Project owner user identifier
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Project title
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Project description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Current project status
    /// </summary>
    public string Status { get; set; } = "Active";

    /// <summary>
    /// Project priority level (1-5)
    /// </summary>
    public int Priority { get; set; } = 1;

    /// <summary>
    /// Project start date
    /// </summary>
    public DateTime? StartDate { get; set; }

    /// <summary>
    /// Project due date
    /// </summary>
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Project creation timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Last update timestamp
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
