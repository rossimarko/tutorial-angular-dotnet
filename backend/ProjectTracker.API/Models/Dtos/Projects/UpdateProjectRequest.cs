using System.ComponentModel.DataAnnotations;

namespace ProjectTracker.API.Models.Dtos.Projects;

/// <summary>
/// Request model for updating an existing project
/// </summary>
public class UpdateProjectRequest
{
    /// <summary>
    /// Project title (maximum 200 characters)
    /// </summary>
    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public required string Title { get; set; }

    /// <summary>
    /// Project description (maximum 1000 characters)
    /// </summary>
    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
    public string? Description { get; set; }

    /// <summary>
    /// Project status (default: Active)
    /// </summary>
    [StringLength(50)]
    public string Status { get; set; } = "Active";

    /// <summary>
    /// Project priority from 1 to 5
    /// </summary>
    [Range(1, 5, ErrorMessage = "Priority must be between 1 and 5")]
    public int Priority { get; set; } = 1;

    /// <summary>
    /// Project start date
    /// </summary>
    public DateTime? StartDate { get; set; }

    /// <summary>
    /// Project due date
    /// </summary>
    public DateTime? DueDate { get; set; }
}
