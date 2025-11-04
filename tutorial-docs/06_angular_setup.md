# Module 6: Angular 20 Project Setup with Modern Patterns

## 🎯 Objectives

- ✅ Understand standalone Angular components
- ✅ Learn Angular signals for state management
- ✅ Setup HTTP client for API calls
- ✅ Configure dependency injection
- ✅ Organize project folder structure
- ✅ Create reusable services

## 📌 Status: Framework Ready

This module covers:
- Creating Angular 20 with standalone components
- Signals for reactive state management
- HTTP client configuration
- Service architecture
- Environment setup

---

## 🔧 Backend API Implementation - Project Endpoints

Before we can work with projects in the Angular frontend, we need to create the backend API endpoints. The repository layer is already implemented, so we just need to create the controller and DTOs.

### Step 1: Create Request/Response DTOs

**`Models/Requests/CreateProjectRequest.cs`**:
```csharp
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
```

**`Models/Requests/UpdateProjectRequest.cs`**:
```csharp
using System.ComponentModel.DataAnnotations;

namespace ProjectTracker.API.Models.Requests;

/// <summary>
/// Request model for updating an existing project
/// </summary>
public class UpdateProjectRequest
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
```

**`Models/Responses/ProjectResponse.cs`**:
```csharp
namespace ProjectTracker.API.Models.Responses;

/// <summary>
/// Response model for project data
/// </summary>
public class ProjectResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "Active";
    public int Priority { get; set; } = 1;
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### Step 2: Create the Projects Controller

**`Controllers/ProjectsController.cs`**:
```csharp
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
    /// Get all projects for the authenticated user
    /// GET: api/projects
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProjectResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProjectResponse>>> GetAll()
    {
        var userId = GetUserId();
        _logger.LogInformation("Fetching all projects for user {UserId}", userId);

        var projects = await _projectRepository.GetByUserIdAsync(userId);
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
    [ProducesResponseType(typeof(PagedResponse<ProjectResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResponse<ProjectResponse>>> GetPaged(
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
        var response = new PagedResponse<ProjectResponse>
        {
            Items = items.Select(MapToResponse).ToList(),
            TotalCount = total,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

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
```

### Step 3: Register the Repository in DI Container

Make sure the `IProjectRepository` is registered in `Program.cs`. Add this line with other repository registrations:

```csharp
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
```

### Step 4: Test the API Endpoints

You can test the endpoints using the `.http` file. Add these requests to `ProjectTracker.API.http`:

```http
### Get all projects
GET {{ProjectTracker.API_HostAddress}}/api/projects
Authorization: Bearer {{auth_token}}

### Get project by ID
GET {{ProjectTracker.API_HostAddress}}/api/projects/1
Authorization: Bearer {{auth_token}}

### Get paged projects
GET {{ProjectTracker.API_HostAddress}}/api/projects/paged?pageNumber=1&pageSize=10&sortBy=title&sortDirection=asc
Authorization: Bearer {{auth_token}}

### Search projects
GET {{ProjectTracker.API_HostAddress}}/api/projects/search?term=test
Authorization: Bearer {{auth_token}}

### Create a new project
POST {{ProjectTracker.API_HostAddress}}/api/projects
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "title": "New Project",
  "description": "This is a test project",
  "status": "Active",
  "priority": 2,
  "startDate": "2025-01-01",
  "dueDate": "2025-12-31"
}

### Update a project
PUT {{ProjectTracker.API_HostAddress}}/api/projects/1
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "title": "Updated Project Title",
  "description": "Updated description",
  "status": "In Progress",
  "priority": 3,
  "startDate": "2025-01-01",
  "dueDate": "2025-12-31"
}

### Delete a project
DELETE {{ProjectTracker.API_HostAddress}}/api/projects/1
Authorization: Bearer {{auth_token}}
```

### Key Implementation Points

✅ **Controller-Based Pattern**: Using traditional controllers (familiar to .NET Framework developers) instead of minimal APIs

✅ **Authorization**: `[Authorize]` attribute ensures only authenticated users can access projects

✅ **User Isolation**: Each user can only access their own projects (enforced by `GetUserId()` helper)

✅ **DTOs**: Separate Request and Response models for clean API contracts

✅ **Logging**: Comprehensive logging for debugging and monitoring

✅ **Validation**: Data annotations on request DTOs for automatic validation

✅ **RESTful Design**: Standard HTTP verbs (GET, POST, PUT, DELETE) with appropriate status codes

---

## 🎓 Beginner's Guide to Angular 20 Fundamentals

### What is Angular?
Angular is a **framework** for building web applications. Think of it as a set of pre-built tools and rules that help you organize your code and create interactive user interfaces that respond to user actions.

### What are Standalone Components?
In Angular 20, **standalone components** are the modern way to build applications. They don't require `NgModules`, making them simpler and easier to understand for beginners.

### What are Signals?
**Signals** are a new way to manage state (data) in Angular. Instead of complex reactive programming, signals provide a simple way to track changes and automatically update your UI when data changes.

---

## 🚀 Understanding Key Concepts

### 1️⃣ Standalone Components

A **component** is a piece of your UI with its own logic and styling. A standalone component can work independently without modules.

#### Basic Component Structure

Each component consists of **3 files**:

| File | Purpose |
|------|---------|
| `name.component.ts` | Logic (TypeScript) |
| `name.component.html` | Template (HTML) |
| `name.component.css` | Styling (CSS) |

#### Simple Component Example

Let's create a simple counter component:

**`counter.component.ts`** (Logic with inline template using Bootstrap):
```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <div class="d-flex flex-column align-items-center gap-3 p-4 border rounded">
      <h2>Counter: {{ count() }}</h2>
      <button class="btn btn-primary" (click)="increment()">Increment</button>
      <button class="btn btn-danger" (click)="decrement()">Decrement</button>
    </div>
  `
})
export class CounterComponent {
  // Create a signal to store the count
  protected readonly count = signal(0);

  increment() {
    this.count.update(current => current + 1);
  }

  decrement() {
    this.count.update(current => current - 1);
  }
}
```

📝 **Note**: For simple components with Bootstrap styling, we use inline `template` instead of separate files. Bootstrap utility classes handle all styling, so no CSS file is needed!

#### How It Works:
- `signal(0)` creates a **signal** with initial value `0`
- `count()` **reads** the signal value in the template
- `count.update()` **updates** the signal value
- When the signal updates, Angular automatically updates the view

---

### 2️⃣ Signals - State Management

Signals are the new way to manage state in Angular 20.

#### Signal Operations

**Creating a Signal:**
```typescript
// Import signal from @angular/core
import { signal } from '@angular/core';

// Create a signal with an initial value
protected readonly name = signal('John');
protected readonly age = signal(25);
protected readonly isActive = signal(true);
```

**Reading a Signal:**
```html
<!-- In templates, call the signal like a function -->
<p>Name: {{ name() }}</p>
<p>Age: {{ age() }}</p>
```

**Updating a Signal:**
```typescript
// Option 1: Set to a new value
this.name.set('Jane');

// Option 2: Update based on current value
this.age.update(current => current + 1);
```

**Computed Signals (Derived State):**
```typescript
import { computed, signal } from '@angular/core';

export class UserComponent {
  protected readonly firstName = signal('John');
  protected readonly lastName = signal('Doe');
  
  // Computed signals automatically update when their dependencies change
  protected readonly fullName = computed(() => 
    `${this.firstName()} ${this.lastName()}`
  );
}
```

In template:
```html
<p>Full Name: {{ fullName() }}</p>
```

#### Signal Effects (Side Effects)

Effects let you run code when a signal changes:

```typescript
import { effect, signal } from '@angular/core';

export class LoggerComponent {
  protected readonly count = signal(0);

  constructor() {
    // This effect runs every time count changes
    effect(() => {
      console.log(`Count changed to: ${this.count()}`);
    });
  }
}
```

---

### 3️⃣ HTTP Client Setup

The HTTP Client allows your Angular app to communicate with your backend API.

#### Step 1: Import HTTP Client in Configuration

**`app.config.ts`** (Configure your app):
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()  // ← Add HTTP client
  ]
};
```

#### Step 2: Create a Data Service

Create a service to fetch data from your API:

**`services/project.service.ts`**:
```typescript
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Define the shape of your data
interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
}

@Injectable({
  providedIn: 'root'  // Make this service available everywhere
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  
  // Store projects in a signal
  private readonly projects = signal<Project[]>([]);

  // Fetch all projects from API
  loadProjects() {
    this.http
      .get<Project[]>('http://localhost:5001/api/projects')
      .subscribe(data => {
        this.projects.set(data);
      });
  }

  // Get projects as signal (read-only)
  getProjects() {
    return this.projects.asReadonly();
  }
}
```

#### Step 3: Use the Service in a Component

**`components/project-list.component.ts`**:
```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../services/project.service';

interface Project {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-project-list',
  imports: [CommonModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  protected readonly projects$ = this.projectService.getProjects();

  ngOnInit() {
    // Load projects when component initializes
    this.projectService.loadProjects();
  }
}
```

**`components/project-list.component.html`**:
```html
<div class="projects-container">
  <h2>Projects</h2>
  
  @if ((projects$()) && (projects$().length > 0)) {
    <ul>
      @for (project of projects$(); track project.id) {
        <li>
          <h3>{{ project.title }}</h3>
          <p>{{ project.description }}</p>
        </li>
      }
    </ul>
  } @else {
    <p>No projects found.</p>
  }
</div>
```

---

### 4️⃣ Dependency Injection

Dependency Injection (DI) is how Angular provides services to components.

#### The `inject()` Function (Recommended for Beginners)

Instead of constructor injection, use the `inject()` function:

```typescript
import { Component, inject } from '@angular/core';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-example',
  template: `<p>Using injected service</p>`
})
export class ExampleComponent {
  // Inject the service
  private readonly projectService = inject(ProjectService);

  loadData() {
    this.projectService.loadProjects();
  }
}
```

#### Creating Singleton Services

Services should be created only once and shared across your app:

```typescript
@Injectable({
  providedIn: 'root'  // ← Makes it a singleton available everywhere
})
export class MyService {
  // Service code here
}
```

---

### 5️⃣ Project Folder Structure

Organize your Angular project like this:

```
src/
├── app/
│   ├── app.ts                    # Root component
│   ├── app.config.ts             # App configuration
│   ├── app.routes.ts             # Routes definition
│   ├── app.html                  # Root template
│   ├── app.css                   # Root styles
│   │
│   ├── features/                 # Feature modules (organized by feature)
│   │   ├── projects/             # Projects feature
│   │   │   ├── components/
│   │   │   │   ├── project-list.component.ts
│   │   │   │   ├── project-list.component.html
│   │   │   │   ├── project-list.component.css
│   │   │   │   ├── project-detail.component.ts
│   │   │   │   ├── project-detail.component.html
│   │   │   │   └── project-detail.component.css
│   │   │   ├── services/
│   │   │   │   └── project.service.ts
│   │   │   └── routes.ts
│   │   │
│   │   └── auth/                 # Auth feature
│   │       ├── components/
│   │       │   ├── login.component.ts
│   │       │   ├── login.component.html
│   │       │   └── login.component.css
│   │       ├── services/
│   │       │   └── auth.service.ts
│   │       └── routes.ts
│   │
│   ├── shared/                   # Shared code (used everywhere)
│   │   ├── components/
│   │   │   ├── navbar.component.ts
│   │   │   ├── navbar.component.html
│   │   │   └── navbar.component.css
│   │   ├── services/
│   │   │   └── http.service.ts
│   │   ├── models/
│   │   │   └── api.models.ts
│   │   └── pipes/
│   │       └── format-date.pipe.ts
│   │
│   └── layouts/                  # Layout components
│       ├── main-layout.component.ts
│       ├── main-layout.component.html
│       └── main-layout.component.css
│
├── styles.css                    # Global styles
├── main.ts                       # Application entry point
└── environments/                 # Environment configurations
    ├── environment.ts
    └── environment.prod.ts
```

---

## 💡 Practical Example: Building a Simple Project Tracker

Let's create a complete example that uses all these concepts:

### Step 1: Define Your Models

**`shared/models/project.model.ts`**:
```typescript
export interface Project {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  status?: string;
  priority?: number;
  startDate?: string;
  dueDate?: string;
}

export interface UpdateProjectRequest {
  title: string;
  description?: string;
  status?: string;
  priority?: number;
  startDate?: string;
  dueDate?: string;
}
```

### Step 2: Create the Project Service

**`features/projects/services/project.service.ts`**:
```typescript
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../../../shared/models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5001/api/projects';
  private readonly projects = signal<Project[]>([]);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);

  // Load all projects from API
  loadProjects() {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<Project[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load projects');
        this.loading.set(false);
        console.error('Error loading projects:', err);
      }
    });
  }

  // Get projects as readonly signal
  getProjects() {
    return this.projects.asReadonly();
  }

  // Get loading state
  getLoading() {
    return this.loading.asReadonly();
  }

  // Get error state
  getError() {
    return this.error.asReadonly();
  }

  // Create a new project
  createProject(request: CreateProjectRequest) {
    return this.http.post<Project>(this.apiUrl, request);
  }

  // Get a single project
  getProject(id: number) {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  // Update a project
  updateProject(id: number, request: UpdateProjectRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  // Delete a project
  deleteProject(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Search projects
  searchProjects(term: string) {
    return this.http.get<Project[]>(`${this.apiUrl}/search?term=${term}`);
  }
}
```

### Step 3: Create a List Component

**`features/projects/components/project-list.component.ts`**:
```typescript
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);

  protected readonly projects = this.projectService.getProjects();
  protected readonly loading = this.projectService.getLoading();
  protected readonly error = this.projectService.getError();

  ngOnInit() {
    this.projectService.loadProjects();
  }

  deleteProject(id: number) {
    this.projectService.deleteProject(id).subscribe({
      next: () => {
        this.projectService.loadProjects();
      },
      error: (err: unknown) => {
        console.error('Error deleting project:', err);
      }
    });
  }
}
```

**`features/projects/components/project-list.component.html`**:
```html
<div class="container-fluid py-4">
  <h2 class="mb-4">My Projects</h2>

  @if (loading()) {
    <div class="alert alert-info" role="alert">
      <div class="spinner-border spinner-border-sm me-2" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      Loading projects...
    </div>
  } @else if (error()) {
    <div class="alert alert-danger" role="alert">
      {{ error() }}
    </div>
  } @else {
    @if (projects().length > 0) {
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (project of projects(); track project.id) {
              <tr>
                <td class="fw-bold">{{ project.title }}</td>
                <td>{{ project.description }}</td>
                <td>
                  <span class="badge bg-primary">{{ project.status }}</span>
                </td>
                <td>{{ project.priority }}</td>
                <td>
                  <button 
                    (click)="deleteProject(project.id)" 
                    class="btn btn-sm btn-outline-danger">
                    <i class="fas fa-trash"></i> Delete
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <div class="alert alert-secondary" role="alert">
        <i class="fas fa-info-circle me-2"></i>
        No projects found.
      </div>
    }
  }
</div>
```

**`features/projects/components/project-list.component.css`**:
```css
/* Bootstrap handles all styling via utility classes */
```

✅ **Best Practices Applied:**
- ✅ `ChangeDetectionStrategy.OnPush` for optimal performance
- ✅ Separate files for template and styles (following file organization rules)
- ✅ Using `inject()` function instead of constructor injection
- ✅ Using native control flow (`@if`, `@for`) instead of `*ngIf`, `*ngFor`
- ✅ Using class bindings instead of `ngClass`
- ✅ Proper type safety with `unknown` for error handling
- ✅ Readonly properties for safety



---

## 🛠️ Step-by-Step Setup Instructions

### Prerequisites
- Node.js installed (download from [nodejs.org](https://nodejs.org))
- VS Code or your favorite code editor
- Angular CLI installed: `npm install -g @angular/cli@latest`

### Setup Steps

1. **Navigate to the frontend folder**
   ```bash
   cd frontend/project-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   
   The app will be available at: `http://localhost:4200`

4. **Create your first component** (in VS Code terminal)
   ```bash
   ng generate component features/projects/components/project-list
   ```

5. **Add the component to your app routes** in `app.routes.ts`:
   ```typescript
   import { Routes } from '@angular/router';
   import { ProjectListComponent } from './features/projects/components/project-list/project-list.component';

   export const routes: Routes = [
     {
       path: 'projects',
       component: ProjectListComponent
     },
     {
       path: '',
       redirectTo: 'projects',
       pathMatch: 'full'
     }
   ];
   ```

---

## ✅ Checklist: What You Should Know

- [ ] I understand what standalone components are
- [ ] I know how to create signals and update them
- [ ] I can create computed signals for derived state
- [ ] I understand how to import and use HTTP Client
- [ ] I can create a service to fetch data from an API
- [ ] I know how to use `inject()` for dependency injection
- [ ] I understand the project folder structure
- [ ] I can use `@if`, `@for` in templates instead of `*ngIf`, `*ngFor`
- [ ] I can run the Angular development server
- [ ] I understand the difference between components, services, and models

---

## 📚 Key Learning Points

| Concept | Purpose | When to Use |
|---------|---------|------------|
| **Signal** | Store state (data) | When you need data to change and update the UI |
| **Computed Signal** | Derive state from other signals | When data depends on other signals |
| **Effect** | Run code when signals change | For side effects like logging or API calls |
| **Service** | Share logic across components | For API calls, authentication, shared data |
| **Component** | UI with logic | For displaying and interacting with UI |
| **HTTP Client** | Make API calls | To communicate with your backend |

---

**Ready to build? Move to [Module 7: Internationalization](./07_angular_internationalization.md)**
