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
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authHttpInterceptor } from './shared/services/auth.http-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authHttpInterceptor]))  // ← HTTP client with auth interceptor
  ]
};
```

📝 **Note**: The `withInterceptors()` function is used to add HTTP interceptors for handling authentication headers automatically on all requests.

#### Step 2: Create HTTP Interceptor for Authorization

The HTTP interceptor automatically adds JWT tokens to outgoing API requests and handles authentication errors.

**`shared/services/auth.http-interceptor.ts`**:
```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

/**
 * HTTP Interceptor function for adding JWT token to requests
 * This modern functional approach (Angular 14+) adds the Authorization header
 * to all API calls (except auth endpoints) and handles 401 errors
 */
export const authHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Add token to request if it exists and it's not an auth endpoint
  if (token && !req.url.includes('/auth/')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token might be expired, clear it and logout
        authService.logout();
      }
      
      return throwError(() => error);
    })
  );
};
```

✅ **Key Features:**
- ✅ **Automatic Token Injection**: Adds JWT token to every API request
- ✅ **Excludes Auth Endpoints**: Doesn't add token to `/auth/` endpoints
- ✅ **401 Handling**: Automatically clears token and logs user out on 401 errors
- ✅ **Functional Approach**: Modern Angular pattern using `HttpInterceptorFn`

#### Step 3: Create Authentication Service with Signals

The AuthService manages user authentication using modern Angular signals for state management.

**`shared/services/auth.service.ts`**:
```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // State management using signals
  private readonly accessToken = signal<string | null>(null);
  
  // Computed signal that automatically updates when accessToken changes
  private readonly isAuthenticated = computed(() => this.accessToken() !== null);
  
  // BehaviorSubject for backward compatibility with observables
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    // Initialize from localStorage on service creation
    const storedToken = this.getStoredToken();
    this.accessToken.set(storedToken);
    this.tokenSubject.next(storedToken);
  }

  /**
   * Login with email and password
   */
  login(request: LoginRequest) {
    return this.http.post<ApiResponse<TokenResponse>>(`${this.apiUrl}/login`, request);
  }

  /**
   * Register a new user
   */
  register(request: any) {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/register`, request);
  }

  /**
   * Store token after successful login
   */
  setToken(token: string, refreshToken: string) {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    this.accessToken.set(token);
    this.tokenSubject.next(token);
  }

  /**
   * Get current access token
   */
  getToken(): string | null {
    return this.accessToken();
  }

  /**
   * Get token as observable (for backward compatibility)
   */
  getToken$() {
    return this.tokenSubject.asObservable();
  }

  /**
   * Get authentication state as readonly signal
   */
  isAuthenticated$() {
    return this.isAuthenticated.asReadonly();
  }

  /**
   * Logout and clear tokens
   */
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.accessToken.set(null);
    this.tokenSubject.next(null);
  }

  /**
   * Get stored token from localStorage
   */
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }
}
```

✅ **Key Features:**
- ✅ **Signals for State**: Uses `signal()` for reactive token storage
- ✅ **Computed Authentication**: `isAuthenticated` automatically tracks token state
- ✅ **localStorage Persistence**: Token survives page refreshes
- ✅ **Observable Support**: Provides both signals and observables for flexibility

#### Step 4: Create a Data Service

Create a service to fetch data from your API. The HTTP interceptor will automatically add the Authorization header.

**`features/projects/services/project.service.ts`**:
```typescript
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// Define the shape of your data
export interface Project {
  id: number;
  userId: number;
  title: string;
  description?: string;
  status: string;
  priority: number;
  startDate?: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  status: string;
  priority: number;
  startDate?: Date;
  dueDate?: Date;
}

@Injectable({
  providedIn: 'root'  // Make this service available everywhere
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/projects`;
  
  // Store projects in signals
  private readonly projects = signal<Project[]>([]);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);

  /**
   * Load all projects from API
   * The Authorization header is automatically added by authHttpInterceptor
   */
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

  // Delete a project
  deleteProject(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

📝 **Note**: The API calls automatically include the JWT token via the `authHttpInterceptor`. No manual header setup is needed!

#### Step 6: Use the Service in a Component

**`features/projects/components/project-list/project-list.component.ts`**:
```typescript
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',  
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule]
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);

  // Expose services' signals to template
  protected readonly projects = this.projectService.getProjects();
  protected readonly loading = this.projectService.getLoading();
  protected readonly error = this.projectService.getError();

  ngOnInit() {
    // Load projects when component initializes
    // The authorization token is automatically added by authHttpInterceptor
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

**`features/projects/components/project-list/project-list.component.html`**:
```html
<div class="container-fluid py-4">
  <h2 class="mb-4">Projects</h2>

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

✅ **Best Practices Applied:**
- ✅ `ChangeDetectionStrategy.OnPush` for optimal performance
- ✅ Using `inject()` function instead of constructor injection
- ✅ Using native control flow (`@if`, `@for`) instead of `*ngIf`, `*ngFor`
- ✅ Using signals for reactive state management
- ✅ Error handling with user-friendly messages
- ✅ Loading state indicator

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
import { environment } from '../../../environments/environment';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../../../shared/models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/projects`;
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

## 🔐 Authorization Implementation

Your application uses **JWT tokens** for authorization. Here's how it works end-to-end:

### How Authorization Flows

1. **User Logs In**
   ```
   User enters credentials → AuthService.login() → Backend validates → Returns JWT token
   ```

2. **Token Storage**
   ```
   JWT token stored in localStorage via AuthService.setToken()
   ```

3. **API Requests with Token**
   ```
   Component calls ProjectService → HttpClient makes request → authHttpInterceptor adds Bearer token → Backend validates token
   ```

4. **Token Validation**
   ```
   Backend checks authorization header: "Authorization: Bearer {token}"
   If token invalid/expired (401) → authHttpInterceptor catches → authService.logout()
   ```

### Implementation Details

**Complete Flow Example:**

```typescript
// 1. User logs in
const loginResponse = await this.authService.login({ email, password }).toPromise();
this.authService.setToken(loginResponse.data.accessToken, loginResponse.data.refreshToken);

// 2. Make API call (token automatically added by interceptor)
this.projectService.loadProjects();

// Behind the scenes in authHttpInterceptor:
// - Gets token from AuthService: authService.getToken()
// - Adds to request: Authorization: Bearer {token}
// - Sends request to backend
// - If 401 error: authService.logout()
```

### What Happens Without Token

- ❌ Auth endpoints (`/auth/login`, `/auth/register`): Run normally
- ✅ Protected endpoints (`/api/projects`): Return 401 Unauthorized

### What Happens With Expired Token

- The interceptor catches the 401 response
- Calls `authService.logout()` to clear stored token
- User is effectively logged out
- Redirect to login page (handled by guards or components)

---

## ✅ Checklist: What You Should Know

- [ ] I understand what standalone components are
- [ ] I know how to create signals and update them
- [ ] I can create computed signals for derived state
- [ ] I understand how to import and use HTTP Client with interceptors
- [ ] I can create a service to fetch data from an API
- [ ] I know how to use `inject()` for dependency injection
- [ ] I understand the project folder structure
- [ ] I can use `@if`, `@for` in templates instead of `*ngIf`, `*ngFor`
- [ ] I can run the Angular development server
- [ ] I understand the difference between components, services, and models
- [ ] I understand how JWT authorization works with HTTP interceptors
- [ ] I know how to store and retrieve tokens from localStorage

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
