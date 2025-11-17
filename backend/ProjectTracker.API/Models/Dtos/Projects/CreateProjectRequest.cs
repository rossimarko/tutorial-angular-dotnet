using System.ComponentModel.DataAnnotations;

namespace ProjectTracker.API.Models.Dtos.Projects;

/// <summary>
/// Request model for creating a new project
/// Uses .NET 10 IValidatableObject for native cross-property validation
/// </summary>
public class CreateProjectRequest : IValidatableObject
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

    /// <summary>
    /// Model-level validation using .NET 10 IValidatableObject
    /// Called automatically by ASP.NET Core validation pipeline
    /// Validates cross-property business rules and complex constraints
    /// </summary>
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // Validation 1: Title must be at least 3 characters
        if (!string.IsNullOrWhiteSpace(Title) && Title.Length < 3)
        {
            yield return new ValidationResult(
                "Title must be at least 3 characters",
                new[] { nameof(Title) }
            );
        }

        // Validation 2: Status must be one of the valid values
        var validStatuses = new[] { "Active", "OnHold", "Completed", "Cancelled" };
        if (!string.IsNullOrWhiteSpace(Status) &&
            !validStatuses.Contains(Status, StringComparer.OrdinalIgnoreCase))
        {
            yield return new ValidationResult(
                "Status must be one of: Active, OnHold, Completed, Cancelled",
                new[] { nameof(Status) }
            );
        }

        // Validation 3: DueDate must be greater than StartDate (cross-property validation)
        if (StartDate.HasValue && DueDate.HasValue)
        {
            if (DueDate <= StartDate)
            {
                yield return new ValidationResult(
                    "Due date must be greater than start date",
                    new[] { nameof(DueDate) }
                );
            }
        }

        // Validation 4: If status is Completed, both dates should be set
        if (Status?.Equals("Completed", StringComparison.OrdinalIgnoreCase) == true)
        {
            if (!StartDate.HasValue || !DueDate.HasValue)
            {
                yield return new ValidationResult(
                    "Completed projects must have both start and due dates",
                    new[] { nameof(StartDate), nameof(DueDate) }
                );
            }
        }
    }
}
