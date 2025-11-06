using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectTracker.API.Data.Repositories;
using ProjectTracker.API.Models.Common;
using ProjectTracker.API.Models.Entities;
using ProjectTracker.API.Models.Requests;
using ProjectTracker.API.Models.Responses;
using System.Security.Claims;

namespace ProjectTracker.API.Controllers;

/// <summary>
/// Controller for managing projects
/// Demonstrates standard ASP.NET Core controller pattern with CRUD operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectRepository _projectRepository;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(
        IProjectRepository projectRepository,
        ILogger<ProjectsController> logger)
    {
        _projectRepository = projectRepository;
        _logger = logger;
    }

    /// <summary>
    /// Get all projects for the authenticated user with optional search, filter, and sorting
    /// GET: api/projects?search=keyword&status=Active&sortBy=title&sortOrder=asc
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProjectResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProjectResponse>>> GetAll(
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] string sortBy = "title",
        [FromQuery] string sortOrder = "asc")
    {
        var userId = GetUserId();
        _logger.LogInformation(
            "Fetching all projects for user {UserId} - Search: {Search}, Status: {Status}, SortBy: {SortBy}, SortOrder: {SortOrder}",
            userId, search, status, sortBy, sortOrder);

        var projects = await _projectRepository.GetByUserIdAsync(userId);

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            projects = projects.Where(p =>
                p.Title.ToLower().Contains(searchLower) ||
                (p.Description?.ToLower().Contains(searchLower) ?? false));
        }

        // Apply status filter
        if (!string.IsNullOrWhiteSpace(status))
        {
            projects = projects.Where(p => p.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
        }

        // Apply sorting
        var sortByLower = sortBy.ToLower();
        projects = sortByLower switch
        {
            "title" => sortOrder.ToLower() == "desc" 
                ? projects.OrderByDescending(p => p.Title)
                : projects.OrderBy(p => p.Title),
            "status" => sortOrder.ToLower() == "desc"
                ? projects.OrderByDescending(p => p.Status)
                : projects.OrderBy(p => p.Status),
            "priority" => sortOrder.ToLower() == "desc"
                ? projects.OrderByDescending(p => p.Priority)
                : projects.OrderBy(p => p.Priority),
            "duedate" => sortOrder.ToLower() == "desc"
                ? projects.OrderByDescending(p => p.DueDate)
                : projects.OrderBy(p => p.DueDate),
            _ => projects.OrderBy(p => p.Title) // Default
        };

        var response = projects.Select(MapToResponse);

        return Ok(response);
    }

    /// <summary>
    /// Get a specific project by ID
    /// GET: api/projects/{id}
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectResponse>> GetById(int id)
    {
        var userId = GetUserId();
        _logger.LogInformation("Fetching project {ProjectId} for user {UserId}", id, userId);

        var project = await _projectRepository.GetByIdAsync(id);

        if (project == null || project.UserId != userId)
        {
            return NotFound(new { message = "Project not found" });
        }

        return Ok(MapToResponse(project));
    }

    /// <summary>
    /// Get paginated projects with search and sorting
    /// GET: api/projects/paged?pageNumber=1&pageSize=10&searchTerm=test&sortBy=title&sortDirection=asc
    /// </summary>
    [HttpGet("paged")]
    [ProducesResponseType(typeof(PaginatedResponse<ProjectResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResponse<ProjectResponse>>> GetPaged(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? sortBy = "CreatedAt",
        [FromQuery] string sortDirection = "desc")
    {
        var userId = GetUserId();
        _logger.LogInformation(
            "Fetching paged projects for user {UserId} - Page: {PageNumber}, Size: {PageSize}",
            userId, pageNumber, pageSize);

        var request = new PaginationRequest
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            SortBy = sortBy,
            SortDirection = sortDirection
        };

        var (items, total) = await _projectRepository.GetPagedAsync(userId, request);
        var response = PaginatedResponse<ProjectResponse>.Create(
           pageNumber,
           pageSize,
           total,
           items.Select(MapToResponse).ToList()
       );

        return Ok(response);
    }

    /// <summary>
    /// Search projects
    /// GET: api/projects/search?term=project
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(IEnumerable<ProjectResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProjectResponse>>> Search([FromQuery] string term)
    {
        var userId = GetUserId();
        _logger.LogInformation("Searching projects for user {UserId} with term: {SearchTerm}", userId, term);

        if (string.IsNullOrWhiteSpace(term))
        {
            return BadRequest(new { message = "Search term is required" });
        }

        var projects = await _projectRepository.SearchAsync(userId, term);
        var response = projects.Select(MapToResponse);

        return Ok(response);
    }

    /// <summary>
    /// Create a new project
    /// POST: api/projects
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProjectResponse>> Create([FromBody] CreateProjectRequest request)
    {
        var userId = GetUserId();
        _logger.LogInformation("Creating new project for user {UserId}", userId);

        var project = new Project
        {
            UserId = userId,
            Title = request.Title,
            Description = request.Description,
            Status = request.Status,
            Priority = request.Priority,
            StartDate = request.StartDate,
            DueDate = request.DueDate
        };

        var id = await _projectRepository.CreateAsync(project);
        project.Id = id;

        _logger.LogInformation("Created project {ProjectId} for user {UserId}", id, userId);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            MapToResponse(project));
    }

    /// <summary>
    /// Update an existing project
    /// PUT: api/projects/{id}
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectRequest request)
    {
        var userId = GetUserId();
        _logger.LogInformation("Updating project {ProjectId} for user {UserId}", id, userId);

        var existing = await _projectRepository.GetByIdAsync(id);
        if (existing == null || existing.UserId != userId)
        {
            return NotFound(new { message = "Project not found" });
        }

        existing.Title = request.Title;
        existing.Description = request.Description;
        existing.Status = request.Status;
        existing.Priority = request.Priority;
        existing.StartDate = request.StartDate;
        existing.DueDate = request.DueDate;

        await _projectRepository.UpdateAsync(existing);

        _logger.LogInformation("Updated project {ProjectId}", id);

        return NoContent();
    }

    /// <summary>
    /// Delete a project
    /// DELETE: api/projects/{id}
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        _logger.LogInformation("Deleting project {ProjectId} for user {UserId}", id, userId);

        var existing = await _projectRepository.GetByIdAsync(id);
        if (existing == null || existing.UserId != userId)
        {
            return NotFound(new { message = "Project not found" });
        }

        await _projectRepository.DeleteAsync(id);

        _logger.LogInformation("Deleted project {ProjectId}", id);

        return NoContent();
    }

    /// <summary>
    /// Extract user ID from JWT claims
    /// </summary>
    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user ID in token");
        }
        return userId;
    }

    /// <summary>
    /// Map entity to response DTO
    /// </summary>
    private static ProjectResponse MapToResponse(Project project)
    {
        return new ProjectResponse
        {
            Id = project.Id,
            UserId = project.UserId,
            Title = project.Title,
            Description = project.Description,
            Status = project.Status,
            Priority = project.Priority,
            StartDate = project.StartDate,
            DueDate = project.DueDate,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt
        };
    }
}
