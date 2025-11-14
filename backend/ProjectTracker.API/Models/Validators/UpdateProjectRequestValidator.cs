using FluentValidation;
using ProjectTracker.API.Models.Dtos.Projects;

namespace ProjectTracker.API.Models.Validators;

/// <summary>
/// Validator for UpdateProjectRequest using FluentValidation
/// Demonstrates comprehensive validation rules including cross-property validation
/// for ensuring DueDate is greater than StartDate
/// </summary>
public class UpdateProjectRequestValidator : AbstractValidator<UpdateProjectRequest>
{
    /// <summary>
    /// Initializes validation rules for updating an existing project
    /// </summary>
    public UpdateProjectRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Title is required")
            .MinimumLength(3)
            .WithMessage("Title must be at least 3 characters")
            .MaximumLength(200)
            .WithMessage("Title cannot exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status is required")
            .MaximumLength(50)
            .WithMessage("Status cannot exceed 50 characters");

        RuleFor(x => x.Priority)
            .InclusiveBetween(1, 5)
            .WithMessage("Priority must be between 1 and 5");

        // Cross-property validation: DueDate must be greater than StartDate
        RuleFor(x => x)
            .Must(ValidateDateRange)
            .WithMessage("Due date must be greater than start date")
            .When(x => x.StartDate.HasValue && x.DueDate.HasValue)
            .WithName("DateRange");
    }

    /// <summary>
    /// Validates that DueDate is greater than StartDate when both are provided
    /// </summary>
    /// <param name="request">The project request being validated</param>
    /// <returns>True if dates are valid, false otherwise</returns>
    private static bool ValidateDateRange(UpdateProjectRequest request)
    {
        if (!request.StartDate.HasValue || !request.DueDate.HasValue)
        {
            return true;
        }

        return request.DueDate > request.StartDate;
    }
}
