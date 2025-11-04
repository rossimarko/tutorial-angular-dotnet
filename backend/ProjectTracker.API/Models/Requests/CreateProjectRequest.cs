using System.ComponentModel.DataAnnotations;

namespace ProjectTracker.API.Models.Requests;

/// <summary>
/// Request model for creating a new project
/// </summary>
public class CreateProjectRequest
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public required string Title { get; set; }

    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
    public string? Description { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [Range(1, 5, ErrorMessage = "Priority must be between 1 and 5")]
    public int Priority { get; set; } = 1;

    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
}
