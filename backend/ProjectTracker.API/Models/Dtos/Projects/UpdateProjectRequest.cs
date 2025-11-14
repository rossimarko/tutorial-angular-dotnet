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
    [Required]
    [StringLength(200)]
    public required string Title { get; set; }

    /// <summary>
    /// Project description (maximum 1000 characters)
    /// </summary>
    [StringLength(1000)]
    public string? Description { get; set; }

    /// <summary>
    /// Project status (default: Active)
    /// </summary>
    [StringLength(50)]
    public string Status { get; set; } = "Active";

    /// <summary>
    /// Project priority from 1 to 5
    /// </summary>
    [Range(1, 5)]
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
