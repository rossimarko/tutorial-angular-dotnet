# Module 11: CRUD Operations - Create, Update & Delete# Module 11: CRUD Operations - Create, Update & Delete# Module 11: CRUD Operations - Create, Update & Delete# Module 11: Add, Edit & Delete Operations



## 🎯 Objectives



By the end of this module, you will understand:## 🎯 Objectives



- ✅ Backend CRUD operations with ASP.NET Core Controllers

- ✅ Frontend CRUD operations with Angular Services

- ✅ Project creation and editing functionalityBy the end of this module, you will understand:## 🎯 Objectives## 🎯 Objectives

- ✅ Project deletion with confirmation

- ✅ Server-side and client-side validation

- ✅ Error handling and user feedback

- ✅ Toast notifications for success/error messages- ✅ Backend CRUD operations with ASP.NET Core Controllers



## 📋 What is CRUD?- ✅ Frontend CRUD operations with Angular Services



**CRUD** stands for the four basic database operations:- ✅ Project creation and editing functionalityBy the end of this module, you will:- ✅ Create form component



- **C**reate: Add new records- ✅ Project deletion with confirmation

- **R**ead: Retrieve/display records (covered in Modules 9-10)

- **U**pdate: Modify existing records- ✅ Server-side and client-side validation- ✅ Build reactive forms with validation- ✅ Update form component

- **D**elete: Remove records

- ✅ Error handling and user feedback

This module demonstrates how both the backend API and Angular frontend implement these operations together.

- ✅ Toast notifications for success/error messages- ✅ Create and edit projects with the same component- ✅ Delete confirmation

---



## 🔙 Backend: ASP.NET Core CRUD Operations

---- ✅ Implement client-side and server-side validation- ✅ Validation (client & server)

### Project Controller Overview



The `ProjectsController` in the backend implements all CRUD operations with proper authorization, validation, and error handling.

## 📋 What is CRUD?- ✅ Add async validators for unique fields- ✅ Error handling

**File: `backend/ProjectTracker.API/Controllers/ProjectsController.cs`**



```csharp

[ApiController]**CRUD** stands for the four basic database operations:- ✅ Create delete confirmation modals- ✅ Success notifications

[Route("api/[controller]")]

[Authorize]

public class ProjectsController : ControllerBase

{- **C**reate: Add new records- ✅ Build a toast notification service

    private readonly IProjectRepository _projectRepository;

    private readonly ILogger<ProjectsController> _logger;- **R**ead: Retrieve/display records (covered in Modules 9-10)



    public ProjectsController(- **U**pdate: Modify existing records- ✅ Handle form errors gracefully## 📌 Status: Framework Ready

        IProjectRepository projectRepository,

        ILogger<ProjectsController> logger)- **D**elete: Remove records

    {

        _projectRepository = projectRepository;- ✅ Manage form state (pristine, dirty, touched)

        _logger = logger;

    }This module demonstrates how both the backend API and Angular frontend implement these operations together.



    // CRUD methods follow...Implement:

}

```---



### Backend Request/Response Models## 📋 What is CRUD?- [ ] Project form (create/edit)



#### Create Project Request## 🔙 Backend: ASP.NET Core CRUD Operations



**File: `backend/ProjectTracker.API/Models/Requests/CreateProjectRequest.cs`**- [ ] Reactive form validation



```csharp### Project Controller Overview

using System.ComponentModel.DataAnnotations;

**CRUD** stands for the four basic database operations:- [ ] Async validation

namespace ProjectTracker.API.Models.Requests;

The `ProjectsController` in the backend implements all CRUD operations with proper authorization, validation, and error handling.

/// <summary>

/// Request model for creating a new project- **C**reate: Add new records- [ ] Delete confirmation modal

/// </summary>

public class CreateProjectRequest**File: `backend/ProjectTracker.API/Controllers/ProjectsController.cs`**

{

    [Required(ErrorMessage = "Title is required")]- **R**ead: Retrieve/display records (covered in Modules 9-10)- [ ] Success/error toast notifications

    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]

    public required string Title { get; set; }```csharp



    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")][ApiController]- **U**pdate: Modify existing records- [ ] Form state management

    public string? Description { get; set; }

[Route("api/[controller]")]

    [StringLength(50)]

    public string Status { get; set; } = "Active";[Authorize]- **D**elete: Remove records



    [Range(1, 5, ErrorMessage = "Priority must be between 1 and 5")]public class ProjectsController : ControllerBase

    public int Priority { get; set; } = 1;

{---

    public DateTime? StartDate { get; set; }

    private readonly IProjectRepository _projectRepository;

    public DateTime? DueDate { get; set; }

}    private readonly ILogger<ProjectsController> _logger;### Form Best Practices:

```



#### Update Project Request

    public ProjectsController(- **Reactive Forms**: Type-safe, testable, composable**Next: [Module 12: Bootstrap UI](./12_bootstrap_ui.md)**

**File: `backend/ProjectTracker.API/Models/Requests/UpdateProjectRequest.cs`**

        IProjectRepository projectRepository,

```csharp

using System.ComponentModel.DataAnnotations;        ILogger<ProjectsController> logger)- **Validation**: Prevent invalid data at submission



namespace ProjectTracker.API.Models.Requests;    {- **User Feedback**: Clear error messages, success notifications



/// <summary>        _projectRepository = projectRepository;- **Confirmation**: Ask before destructive actions (delete)

/// Request model for updating an existing project

/// </summary>        _logger = logger;- **Loading States**: Disable form during API calls

public class UpdateProjectRequest

{    }

    [Required(ErrorMessage = "Title is required")]

    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]---

    public required string Title { get; set; }

    // CRUD methods follow...

    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]

    public string? Description { get; set; }}## 📝 Step 1: Toast Notification Service



    [StringLength(50)]```

    public string Status { get; set; } = "Active";

First, let's create a service to show success/error notifications.

    [Range(1, 5, ErrorMessage = "Priority must be between 1 and 5")]

    public int Priority { get; set; } = 1;### Backend Request/Response Models



    public DateTime? StartDate { get; set; }Create file: `frontend/project-tracker/src/app/shared/services/notification.service.ts`



    public DateTime? DueDate { get; set; }#### Create Project Request

}

``````typescript



#### Project Response**File: `backend/ProjectTracker.API/Models/Requests/CreateProjectRequest.cs`**import { Injectable, signal } from '@angular/core';



**File: `backend/ProjectTracker.API/Models/Responses/ProjectResponse.cs`**



```csharp```csharp/// <summary>

namespace ProjectTracker.API.Models.Responses;

using System.ComponentModel.DataAnnotations;/// Toast notification type

/// <summary>

/// Response model for project data/// </summary>

/// </summary>

public class ProjectResponsenamespace ProjectTracker.API.Models.Requests;export type NotificationType = 'success' | 'error' | 'warning' | 'info';

{

    public int Id { get; set; }



    public int UserId { get; set; }/// <summary>/// <summary>



    public string Title { get; set; } = string.Empty;/// Request model for creating a new project/// Toast notification model



    public string? Description { get; set; }/// </summary>/// </summary>



    public string Status { get; set; } = "Active";public class CreateProjectRequestexport interface Toast {



    public int Priority { get; set; } = 1;{  id: number;



    public DateTime? StartDate { get; set; }    [Required(ErrorMessage = "Title is required")]  type: NotificationType;



    public DateTime? DueDate { get; set; }    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]  title: string;



    public DateTime CreatedAt { get; set; }    public required string Title { get; set; }  message: string;



    public DateTime UpdatedAt { get; set; }  duration: number;

}

```    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]}



### Backend CRUD Endpoints    public string? Description { get; set; }



#### Create - POST /api/projects/// <summary>



```csharp    [StringLength(50)]/// Service for displaying toast notifications

/// <summary>

/// Create a new project    public string Status { get; set; } = "Active";/// </summary>

/// POST: api/projects

/// </summary>@Injectable({

[HttpPost]

[ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status201Created)]    [Range(1, 5, ErrorMessage = "Priority must be between 1 and 5")]  providedIn: 'root'

[ProducesResponseType(StatusCodes.Status400BadRequest)]

public async Task<ActionResult<ProjectResponse>> Create([FromBody] CreateProjectRequest request)    public int Priority { get; set; } = 1;})

{

    var userId = GetUserId();export class NotificationService {

    _logger.LogInformation("Creating new project for user {UserId}", userId);

    public DateTime? StartDate { get; set; }  private readonly toasts = signal<Toast[]>([]);

    var project = new Project

    {    public DateTime? DueDate { get; set; }  private nextId = 1;

        UserId = userId,

        Title = request.Title,}

        Description = request.Description,

        Status = request.Status,```  /// <summary>

        Priority = request.Priority,

        StartDate = request.StartDate,  /// Get current toasts as readonly signal

        DueDate = request.DueDate

    };#### Update Project Request  /// </summary>



    var id = await _projectRepository.CreateAsync(project);  getToasts() {

    project.Id = id;

**File: `backend/ProjectTracker.API/Models/Requests/UpdateProjectRequest.cs`**    return this.toasts.asReadonly();

    _logger.LogInformation("Created project {ProjectId} for user {UserId}", id, userId);

  }

    return CreatedAtAction(

        nameof(GetById),```csharp

        new { id },

        MapToResponse(project));using System.ComponentModel.DataAnnotations;  /// <summary>

}

```  /// Show success notification



**Key Features:**namespace ProjectTracker.API.Models.Requests;  /// </summary>



- ✅ Server-side validation via `DataAnnotations`  success(title: string, message: string, duration: number = 3000): void {

- ✅ User ID extraction from JWT claims

- ✅ Returns 201 Created with Location header/// <summary>    this.show('success', title, message, duration);

- ✅ Structured logging

/// Request model for updating an existing project  }

#### Read - GET /api/projects/{id}

/// </summary>

```csharp

/// <summary>public class UpdateProjectRequest  /// <summary>

/// Get a specific project by ID

/// GET: api/projects/{id}{  /// Show error notification

/// </summary>

[HttpGet("{id}")]    [Required(ErrorMessage = "Title is required")]  /// </summary>

[ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status200OK)]

[ProducesResponseType(StatusCodes.Status404NotFound)]    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]  error(title: string, message: string, duration: number = 5000): void {

public async Task<ActionResult<ProjectResponse>> GetById(int id)

{    public required string Title { get; set; }    this.show('error', title, message, duration);

    var userId = GetUserId();

    _logger.LogInformation("Fetching project {ProjectId} for user {UserId}", id, userId);  }



    var project = await _projectRepository.GetByIdAsync(id);    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]



    if (project is null || project.UserId != userId)    public string? Description { get; set; }  /// <summary>

    {

        return NotFound(new { message = "Project not found" });  /// Show warning notification

    }

    [StringLength(50)]  /// </summary>

    return Ok(MapToResponse(project));

}    public string Status { get; set; } = "Active";  warning(title: string, message: string, duration: number = 4000): void {

```

    this.show('warning', title, message, duration);

**Key Features:**

    [Range(1, 5, ErrorMessage = "Priority must be between 1 and 5")]  }

- ✅ User ownership verification

- ✅ 404 Not Found for missing or unauthorized projects    public int Priority { get; set; } = 1;



#### Update - PUT /api/projects/{id}  /// <summary>



```csharp    public DateTime? StartDate { get; set; }  /// Show info notification

/// <summary>

/// Update an existing project    public DateTime? DueDate { get; set; }  /// </summary>

/// PUT: api/projects/{id}

/// </summary>}  info(title: string, message: string, duration: number = 3000): void {

[HttpPut("{id}")]

[ProducesResponseType(StatusCodes.Status204NoContent)]```    this.show('info', title, message, duration);

[ProducesResponseType(StatusCodes.Status400BadRequest)]

[ProducesResponseType(StatusCodes.Status404NotFound)]  }

public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectRequest request)

{#### Project Response

    var userId = GetUserId();

    _logger.LogInformation("Updating project {ProjectId} for user {UserId}", id, userId);  /// <summary>



    var existing = await _projectRepository.GetByIdAsync(id);**File: `backend/ProjectTracker.API/Models/Responses/ProjectResponse.cs`**  /// Show notification



    if (existing is null || existing.UserId != userId)  /// </summary>

    {

        return NotFound(new { message = "Project not found" });```csharp  private show(type: NotificationType, title: string, message: string, duration: number): void {

    }

namespace ProjectTracker.API.Models.Responses;    const toast: Toast = {

    existing.Title = request.Title;

    existing.Description = request.Description;      id: this.nextId++,

    existing.Status = request.Status;

    existing.Priority = request.Priority;/// <summary>      type,

    existing.StartDate = request.StartDate;

    existing.DueDate = request.DueDate;/// Response model for project data      title,



    await _projectRepository.UpdateAsync(existing);/// </summary>      message,



    _logger.LogInformation("Updated project {ProjectId}", id);public class ProjectResponse      duration



    return NoContent();{    };

}

```    public int Id { get; set; }



**Key Features:**    public int UserId { get; set; }    this.toasts.update(toasts => [...toasts, toast]);



- ✅ Ownership verification before update    public string Title { get; set; } = string.Empty;

- ✅ Returns 204 No Content

- ✅ Automatic timestamp updates in repository    public string? Description { get; set; }    // Auto-remove after duration



#### Delete - DELETE /api/projects/{id}    public string Status { get; set; } = "Active";    if (duration > 0) {



```csharp    public int Priority { get; set; } = 1;      setTimeout(() => this.remove(toast.id), duration);

/// <summary>

/// Delete a project    public DateTime? StartDate { get; set; }    }

/// DELETE: api/projects/{id}

/// </summary>    public DateTime? DueDate { get; set; }  }

[HttpDelete("{id}")]

[ProducesResponseType(StatusCodes.Status204NoContent)]    public DateTime CreatedAt { get; set; }

[ProducesResponseType(StatusCodes.Status404NotFound)]

public async Task<IActionResult> Delete(int id)    public DateTime UpdatedAt { get; set; }  /// <summary>

{

    var userId = GetUserId();}  /// Remove notification by ID

    _logger.LogInformation("Deleting project {ProjectId} for user {UserId}", id, userId);

```  /// </summary>

    var existing = await _projectRepository.GetByIdAsync(id);

  remove(id: number): void {

    if (existing is null || existing.UserId != userId)

    {### Backend CRUD Endpoints    this.toasts.update(toasts => toasts.filter(t => t.id !== id));

        return NotFound(new { message = "Project not found" });

    }  }



    await _projectRepository.DeleteAsync(id);#### Create - POST /api/projects



    _logger.LogInformation("Deleted project {ProjectId}", id);  /// <summary>



    return NoContent();```csharp  /// Clear all notifications

}

```/// <summary>  /// </summary>



**Key Features:**/// Create a new project  clear(): void {



- ✅ Owner verification/// POST: api/projects    this.toasts.set([]);

- ✅ Returns 204 No Content

- ✅ Audit logging/// </summary>  }



---[HttpPost]}



## 🎨 Frontend: Angular CRUD Operations[ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status201Created)]```



### Project Models[ProducesResponseType(StatusCodes.Status400BadRequest)]



**File: `frontend/project-tracker/src/app/shared/models/project.model.ts`**public async Task<ActionResult<ProjectResponse>> Create([FromBody] CreateProjectRequest request)Create file: `frontend/project-tracker/src/app/shared/components/toast-container/toast-container.component.ts`



```typescript{

/// <summary>

/// Project entity model    var userId = GetUserId();```typescript

/// </summary>

export interface Project {    _logger.LogInformation("Creating new project for user {UserId}", userId);import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

    id: number;

    userId: number;import { CommonModule } from '@angular/common';

    title: string;

    description?: string;    var project = new Projectimport { NotificationService, NotificationType } from '../../services/notification.service';

    status: string;

    priority: number;    {import { TranslatePipe } from '../../pipes/translate.pipe';

    startDate?: Date;

    dueDate?: Date;        UserId = userId,

    createdAt: Date;

    updatedAt: Date;        Title = request.Title,/// <summary>

}

        Description = request.Description,/// Container component for displaying toast notifications

/// <summary>

/// Request to create a new project        Status = request.Status,/// </summary>

/// </summary>

export interface CreateProjectRequest {        Priority = request.Priority,@Component({

    title: string;

    description?: string;        StartDate = request.StartDate,  selector: 'app-toast-container',

    status: string;

    priority: number;        DueDate = request.DueDate  imports: [CommonModule, TranslatePipe],

    startDate?: Date;

    dueDate?: Date;    };  templateUrl: './toast-container.component.html',

}

  styleUrl: './toast-container.component.css',

/// <summary>

/// Request to update an existing project    var id = await _projectRepository.CreateAsync(project);  changeDetection: ChangeDetectionStrategy.OnPush

/// </summary>

export interface UpdateProjectRequest extends CreateProjectRequest {}    project.Id = id;})



/// <summary>export class ToastContainerComponent {

/// Paged result wrapper - matches backend response structure

/// </summary>    _logger.LogInformation("Created project {ProjectId} for user {UserId}", id, userId);  private readonly notificationService = inject(NotificationService);

export interface PaginatedResponse<T> {

    pageNumber: number;  

    pageSize: number;

    totalCount: number;    return CreatedAtAction(  protected readonly toasts = this.notificationService.getToasts();

    totalPages: number;

    hasNextPage: boolean;        nameof(GetById),

    hasPreviousPage: boolean;

    items: T[];        new { id },  /// <summary>

}

        MapToResponse(project));  /// Get Bootstrap class for toast type

/// <summary>

/// Project-specific pagination type}  /// </summary>

/// </summary>

export type ProjectPaginatedResponse = PaginatedResponse<Project>;```  getToastClass(type: NotificationType): string {



/// <summary>    const classes: Record<NotificationType, string> = {

/// Pagination parameters for API requests

/// </summary>**Key Features:**      success: 'bg-success text-white',

export interface PaginationParams {

    pageNumber: number;- ✅ Server-side validation via `DataAnnotations`      error: 'bg-danger text-white',

    pageSize: number;

    searchTerm?: string;- ✅ User ID extraction from JWT claims      warning: 'bg-warning text-dark',

    sortBy?: string;

    sortDirection?: 'asc' | 'desc';- ✅ Returns 201 Created with Location header      info: 'bg-info text-white'

}

- ✅ Structured logging    };

/// <summary>

/// Project status enum    return classes[type];

/// </summary>

export type ProjectStatus = 'Active' | 'Completed' | 'OnHold' | 'Cancelled';#### Read - GET /api/projects/{id}  }

```



### Project Service

```csharp  /// <summary>

**File: `frontend/project-tracker/src/app/features/projects/services/project.service.ts`**

/// <summary>  /// Get icon for toast type

The service manages all CRUD operations and state using signals:

/// Get a specific project by ID  /// </summary>

```typescript

import { Injectable, inject, signal } from '@angular/core';/// GET: api/projects/{id}  getToastIcon(type: NotificationType): string {

import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, tap, catchError, of } from 'rxjs';/// </summary>    const icons: Record<NotificationType, string> = {

import { environment } from '../../../../environments/environment';

import {[HttpGet("{id}")]      success: 'fas fa-check-circle',

    Project,

    ProjectPaginatedResponse,[ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status200OK)]      error: 'fas fa-exclamation-circle',

    PaginationParams,

    CreateProjectRequest,[ProducesResponseType(StatusCodes.Status404NotFound)]      warning: 'fas fa-exclamation-triangle',

    UpdateProjectRequest

} from '../../../shared/models/project.model';public async Task<ActionResult<ProjectResponse>> GetById(int id)      info: 'fas fa-info-circle'



/// <summary>{    };

/// Service for managing projects with pagination support

/// Uses signals for state management and server-side pagination    var userId = GetUserId();    return icons[type];

/// </summary>

@Injectable({    _logger.LogInformation("Fetching project {ProjectId} for user {UserId}", id, userId);  }

    providedIn: 'root'

})

export class ProjectService {

    private readonly http = inject(HttpClient);    var project = await _projectRepository.GetByIdAsync(id);  /// <summary>

    private readonly apiUrl = `${environment.apiUrl}/projects`;

  /// Close toast

    // State signals for pagination

    private readonly projects = signal<Project[]>([]);    if (project is null || project.UserId != userId)  /// </summary>

    private readonly loading = signal(false);

    private readonly error = signal<string | null>(null);    {  close(id: number): void {



    /// <summary>        return NotFound(new { message = "Project not found" });    this.notificationService.remove(id);

    /// Create a new project

    /// </summary>    }  }

    createProject(request: CreateProjectRequest): Observable<Project> {

        return this.http.post<Project>(this.apiUrl, request).pipe(}

            tap(() => {

                this.error.set(null);    return Ok(MapToResponse(project));```

            }),

            catchError(error => {}

                this.error.set('Failed to create project');

                console.error('Error creating project:', error);```Create file: `frontend/project-tracker/src/app/shared/components/toast-container/toast-container.component.html`

                throw error;

            })

        );

    }**Key Features:**```html



    /// <summary>- ✅ User ownership verification<div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;">

    /// Get a single project by ID

    /// </summary>- ✅ 404 Not Found for missing or unauthorized projects  @for (toast of toasts(); track toast.id) {

    getProjectById(id: number): Observable<Project> {

        return this.http.get<Project>(`${this.apiUrl}/${id}`);    <div

    }

#### Update - PUT /api/projects/{id}      class="toast show mb-2"

    /// <summary>

    /// Update an existing project      [class]="getToastClass(toast.type)"

    /// </summary>

    updateProject(id: number, request: UpdateProjectRequest): Observable<void> {```csharp      role="alert"

        return this.http.put<void>(`${this.apiUrl}/${id}`, request).pipe(

            tap(() => {/// <summary>      aria-live="assertive"

                this.error.set(null);

            }),/// Update an existing project      aria-atomic="true">

            catchError(error => {

                this.error.set('Failed to update project');/// PUT: api/projects/{id}      <div class="toast-header" [class]="getToastClass(toast.type)">

                console.error('Error updating project:', error);

                throw error;/// </summary>        <i [class]="getToastIcon(toast.type) + ' me-2'"></i>

            })

        );[HttpPut("{id}")]        <strong class="me-auto">{{ toast.title }}</strong>

    }

[ProducesResponseType(StatusCodes.Status204NoContent)]        <button

    /// <summary>

    /// Delete a project[ProducesResponseType(StatusCodes.Status400BadRequest)]          type="button"

    /// </summary>

    deleteProject(id: number): Observable<void> {[ProducesResponseType(StatusCodes.Status404NotFound)]          class="btn-close btn-close-white"

        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(

            tap(() => {public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectRequest request)          (click)="close(toast.id)"

                this.error.set(null);

            }),{          [attr.aria-label]="'common.close' | translate">

            catchError(error => {

                this.error.set('Failed to delete project');    var userId = GetUserId();        </button>

                console.error('Error deleting project:', error);

                throw error;    _logger.LogInformation("Updating project {ProjectId} for user {UserId}", id, userId);      </div>

            })

        );      <div class="toast-body">

    }

    var existing = await _projectRepository.GetByIdAsync(id);        {{ toast.message }}

    /// <summary>

    /// Load paginated projects with optional filters    if (existing is null || existing.UserId != userId)      </div>

    /// </summary>

    loadProjectsPaged(filters?: Partial<PaginationParams>): Observable<ProjectPaginatedResponse> {    {    </div>

        this.loading.set(true);

        this.error.set(null);        return NotFound(new { message = "Project not found" });  }



        let params = new HttpParams()    }</div>

            .set('pageNumber', (filters?.pageNumber ?? 1).toString())

            .set('pageSize', (filters?.pageSize ?? 10).toString());```



        if (filters?.searchTerm) {    existing.Title = request.Title;

            params = params.set('searchTerm', filters.searchTerm);

        }    existing.Description = request.Description;Create file: `frontend/project-tracker/src/app/shared/components/toast-container/toast-container.component.css`



        if (filters?.sortBy) {    existing.Status = request.Status;

            params = params.set('sortBy', filters.sortBy);

        }    existing.Priority = request.Priority;```css



        if (filters?.sortDirection) {    existing.StartDate = request.StartDate;.toast {

            params = params.set('sortDirection', filters.sortDirection);

        }    existing.DueDate = request.DueDate;  min-width: 300px;



        return this.http.get<ProjectPaginatedResponse>(`${this.apiUrl}/paged`, { params }).pipe(  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);

            tap(response => {

                this.projects.set(response.items);    await _projectRepository.UpdateAsync(existing);}

                this.loading.set(false);

            }),

            catchError(error => {

                this.error.set('Failed to load projects');    _logger.LogInformation("Updated project {ProjectId}", id);.toast-header {

                this.loading.set(false);

                console.error('Error loading projects:', error);  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

                return of({

                    items: [],    return NoContent();}

                    pageNumber: 1,

                    pageSize: 10,}

                    totalCount: 0,

                    totalPages: 0,```.btn-close-white {

                    hasPreviousPage: false,

                    hasNextPage: false  filter: invert(1) grayscale(100%) brightness(200%);

                });

            })**Key Features:**}

        );

    }- ✅ Ownership verification before update```

}

```- ✅ Returns 204 No Content



**Key Features:**- ✅ Automatic timestamp updates in repositoryAdd ToastContainer to your main app component template:



- ✅ All CRUD methods return observables

- ✅ Error handling with signal-based state

- ✅ Type-safe models#### Delete - DELETE /api/projects/{id}```html

- ✅ Automatic loading state management

<!-- In app.component.html -->

---

```csharp<app-toast-container></app-toast-container>

## 📝 Step 1: Toast Notification Service

/// <summary><router-outlet></router-outlet>

First, let's create a service to show success/error notifications.

/// Delete a project```

Create file: `frontend/project-tracker/src/app/shared/services/notification.service.ts`

/// DELETE: api/projects/{id}

```typescript

import { Injectable, signal } from '@angular/core';/// </summary>---



/// <summary>[HttpDelete("{id}")]

/// Toast notification type

/// </summary>[ProducesResponseType(StatusCodes.Status204NoContent)]## 📋 Step 2: Project Form Component

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

[ProducesResponseType(StatusCodes.Status404NotFound)]

/// <summary>

/// Toast notification modelpublic async Task<IActionResult> Delete(int id)Create file: `frontend/project-tracker/src/app/features/projects/components/project-form/project-form.component.ts`

/// </summary>

export interface Toast {{

    id: number;

    type: NotificationType;    var userId = GetUserId();```typescript

    title: string;

    message: string;    _logger.LogInformation("Deleting project {ProjectId} for user {UserId}", id, userId);import { Component, inject, signal, OnInit, input, ChangeDetectionStrategy } from '@angular/core';

    duration: number;

}import { CommonModule } from '@angular/common';



/// <summary>    var existing = await _projectRepository.GetByIdAsync(id);import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

/// Service for displaying toast notifications

/// </summary>    if (existing is null || existing.UserId != userId)import { Router, ActivatedRoute } from '@angular/router';

@Injectable({

    providedIn: 'root'    {import { ProjectService } from '../../services/project.service';

})

export class NotificationService {        return NotFound(new { message = "Project not found" });import { NotificationService } from '../../../../shared/services/notification.service';

    private readonly toasts = signal<Toast[]>([]);

    private nextId = 1;    }import { Project, ProjectStatus } from '../../../../shared/models/project.model';



    /// <summary>import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

    /// Get current toasts as readonly signal

    /// </summary>    await _projectRepository.DeleteAsync(id);

    getToasts() {

        return this.toasts.asReadonly();/// <summary>

    }

    _logger.LogInformation("Deleted project {ProjectId}", id);/// Form component for creating and editing projects

    /// <summary>

    /// Show success notification/// Uses same component for both create and edit modes

    /// </summary>

    success(title: string, message: string, duration: number = 3000): void {    return NoContent();/// </summary>

        this.show('success', title, message, duration);

    }}@Component({



    /// <summary>```  selector: 'app-project-form',

    /// Show error notification

    /// </summary>  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],

    error(title: string, message: string, duration: number = 5000): void {

        this.show('error', title, message, duration);**Key Features:**  templateUrl: './project-form.component.html',

    }

- ✅ Owner verification  styleUrl: './project-form.component.css',

    /// <summary>

    /// Show warning notification- ✅ Returns 204 No Content  changeDetection: ChangeDetectionStrategy.OnPush

    /// </summary>

    warning(title: string, message: string, duration: number = 4000): void {- ✅ Audit logging})

        this.show('warning', title, message, duration);

    }export class ProjectFormComponent implements OnInit {



    /// <summary>---  private readonly fb = inject(FormBuilder);

    /// Show info notification

    /// </summary>  private readonly projectService = inject(ProjectService);

    info(title: string, message: string, duration: number = 3000): void {

        this.show('info', title, message, duration);## 🎨 Frontend: Angular CRUD Operations  private readonly notificationService = inject(NotificationService);

    }

  private readonly router = inject(Router);

    /// <summary>

    /// Show notification### Project Models  private readonly route = inject(ActivatedRoute);

    /// </summary>

    private show(type: NotificationType, title: string, message: string, duration: number): void {

        const toast: Toast = {

            id: this.nextId++,**File: `frontend/project-tracker/src/app/shared/models/project.model.ts`**  // Signals for component state

            type,

            title,  protected readonly isEditMode = signal(false);

            message,

            duration```typescript  protected readonly loading = signal(false);

        };

/// <summary>  protected readonly projectId = signal<number | null>(null);

        this.toasts.update(toasts => [...toasts, toast]);

/// Project entity model

        // Auto-remove after duration

        if (duration > 0) {/// </summary>  // Form

            setTimeout(() => this.remove(toast.id), duration);

        }export interface Project {  protected readonly form: FormGroup;

    }

  id: number;

    /// <summary>

    /// Remove notification by ID  userId: number;  // Status options

    /// </summary>

    remove(id: number): void {  title: string;  protected readonly statusOptions: ProjectStatus[] = ['Active', 'Completed', 'OnHold', 'Cancelled'];

        this.toasts.update(toasts => toasts.filter(t => t.id !== id));

    }  description?: string;  protected readonly priorityOptions = [1, 2, 3, 4, 5];



    /// <summary>  status: string;

    /// Clear all notifications

    /// </summary>  priority: number;  constructor() {

    clear(): void {

        this.toasts.set([]);  startDate?: Date;    // Initialize form

    }

}  dueDate?: Date;    this.form = this.fb.group({

```

  createdAt: Date;      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],

Create file: `frontend/project-tracker/src/app/shared/components/toast-container/toast-container.component.ts`

  updatedAt: Date;      description: ['', [Validators.maxLength(1000)]],

```typescript

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';}      status: ['Active', [Validators.required]],

import { CommonModule } from '@angular/common';

import { NotificationService, NotificationType } from '../../services/notification.service';      priority: [3, [Validators.required, Validators.min(1), Validators.max(5)]],

import { TranslatePipe } from '../../pipes/translate.pipe';

/// <summary>      startDate: [null],

/// <summary>

/// Container component for displaying toast notifications/// Request to create a new project      dueDate: [null]

/// </summary>

@Component({/// </summary>    });

    selector: 'app-toast-container',

    imports: [CommonModule, TranslatePipe],export interface CreateProjectRequest {  }

    templateUrl: './toast-container.component.html',

    styleUrl: './toast-container.component.css',  title: string;

    changeDetection: ChangeDetectionStrategy.OnPush

})  description?: string;  ngOnInit(): void {

export class ToastContainerComponent {

    private readonly notificationService = inject(NotificationService);  status: string;    // Check if we're in edit mode



    protected readonly toasts = this.notificationService.getToasts();  priority: number;    const id = this.route.snapshot.paramMap.get('id');



    /// <summary>  startDate?: Date;    if (id) {

    /// Get Bootstrap class for toast type

    /// </summary>  dueDate?: Date;      this.isEditMode.set(true);

    getToastClass(type: NotificationType): string {

        const classes: Record<NotificationType, string> = {}      this.projectId.set(parseInt(id, 10));

            success: 'bg-success text-white',

            error: 'bg-danger text-white',      this.loadProject(parseInt(id, 10));

            warning: 'bg-warning text-dark',

            info: 'bg-info text-white'/// <summary>    }

        };

        return classes[type];/// Request to update an existing project  }

    }

/// </summary>

    /// <summary>

    /// Get icon for toast typeexport interface UpdateProjectRequest extends CreateProjectRequest {}  /// <summary>

    /// </summary>

    getToastIcon(type: NotificationType): string {  /// Load project data for editing

        const icons: Record<NotificationType, string> = {

            success: 'fas fa-check-circle',/// <summary>  /// </summary>

            error: 'fas fa-exclamation-circle',

            warning: 'fas fa-exclamation-triangle',/// Paged result wrapper - matches backend response structure  private loadProject(id: number): void {

            info: 'fas fa-info-circle'

        };/// </summary>    this.loading.set(true);

        return icons[type];

    }export interface PaginatedResponse<T> {    this.projectService.getProjectById(id).subscribe({



    /// <summary>  pageNumber: number;      next: (project) => {

    /// Close toast

    /// </summary>  pageSize: number;        this.form.patchValue({

    close(id: number): void {

        this.notificationService.remove(id);  totalCount: number;          title: project.title,

    }

}  totalPages: number;          description: project.description,

```

  hasNextPage: boolean;          status: project.status,

Create file: `frontend/project-tracker/src/app/shared/components/toast-container/toast-container.component.html`

  hasPreviousPage: boolean;          priority: project.priority,

```html

<div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;">  items: T[];          startDate: this.formatDateForInput(project.startDate),

    @for (toast of toasts(); track toast.id) {

        <div}          dueDate: this.formatDateForInput(project.dueDate)

            class="toast show mb-2"

            [class]="getToastClass(toast.type)"        });

            role="alert"

            aria-live="assertive"/// <summary>        this.loading.set(false);

            aria-atomic="true">

            <div class="toast-header" [class]="getToastClass(toast.type)">/// Project-specific pagination type      },

                <i [class]="getToastIcon(toast.type) + ' me-2'"></i>

                <strong class="me-auto">{{ toast.title }}</strong>/// </summary>      error: (error) => {

                <button

                    type="button"export type ProjectPaginatedResponse = PaginatedResponse<Project>;        console.error('Error loading project:', error);

                    class="btn-close btn-close-white"

                    (click)="close(toast.id)"        this.notificationService.error(

                    [attr.aria-label]="'common.close' | translate">

                </button>/// <summary>          'Error',

            </div>

            <div class="toast-body">/// Pagination parameters for API requests          'Failed to load project data'

                {{ toast.message }}

            </div>/// </summary>        );

        </div>

    }export interface PaginationParams {        this.loading.set(false);

</div>

```  pageNumber: number;        this.router.navigate(['/projects']);



Create file: `frontend/project-tracker/src/app/shared/components/toast-container/toast-container.component.css`  pageSize: number;      }



```css  searchTerm?: string;    });

.toast {

    min-width: 300px;  sortBy?: string;  }

    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);

}  sortDirection?: 'asc' | 'desc';



.toast-header {}  /// <summary>

    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

}```  /// Format date for HTML input (YYYY-MM-DD)



.btn-close-white {  /// </summary>

    filter: invert(1) grayscale(100%) brightness(200%);

}### Project Service  private formatDateForInput(date: Date | null): string | null {

```

    if (!date) return null;

Add ToastContainer to your main app component template:

**File: `frontend/project-tracker/src/app/features/projects/services/project.service.ts`**    const d = new Date(date);

```html

<!-- In app.component.html -->    return d.toISOString().split('T')[0];

<app-toast-container></app-toast-container>

<router-outlet></router-outlet>The service manages all CRUD operations and state using signals:  }

```



---

```typescript  /// <summary>

## 📋 Step 2: Project Form Component

import { Injectable, inject, signal } from '@angular/core';  /// Submit form

Create file: `frontend/project-tracker/src/app/features/projects/components/project-form/project-form.component.ts`

import { HttpClient, HttpParams } from '@angular/common/http';  /// </summary>

```typescript

import { Component, inject, signal, OnInit, input, ChangeDetectionStrategy } from '@angular/core';import { Observable, tap, catchError, of } from 'rxjs';  onSubmit(): void {

import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';import { environment } from '../../../../environments/environment';    if (this.form.invalid) {

import { Router, ActivatedRoute } from '@angular/router';

import { ProjectService } from '../../services/project.service';import {       this.form.markAllAsTouched();

import { NotificationService } from '../../../../shared/services/notification.service';

import { Project, ProjectStatus } from '../../../../shared/models/project.model';  Project,       this.notificationService.warning(

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

  ProjectPaginatedResponse,        'Validation Error',

/// <summary>

/// Form component for creating and editing projects  PaginationParams,        'Please fix the errors in the form'

/// Uses same component for both create and edit modes

/// </summary>  CreateProjectRequest,      );

@Component({

    selector: 'app-project-form',  UpdateProjectRequest      return;

    imports: [CommonModule, ReactiveFormsModule, TranslatePipe],

    templateUrl: './project-form.component.html',} from '../../../shared/models/project.model';    }

    styleUrl: './project-form.component.css',

    changeDetection: ChangeDetectionStrategy.OnPush

})

export class ProjectFormComponent implements OnInit {/// <summary>    this.loading.set(true);

    private readonly fb = inject(FormBuilder);

    private readonly projectService = inject(ProjectService);/// Service for managing projects with pagination support    const formValue = this.form.value;

    private readonly notificationService = inject(NotificationService);

    private readonly router = inject(Router);/// Uses signals for state management and server-side pagination

    private readonly route = inject(ActivatedRoute);

/// </summary>    // Convert date strings to Date objects

    // Signals for component state

    protected readonly isEditMode = signal(false);@Injectable({    const projectData: Partial<Project> = {

    protected readonly loading = signal(false);

    protected readonly projectId = signal<number | null>(null);  providedIn: 'root'      title: formValue.title,



    // Form})      description: formValue.description || null,

    protected readonly form: FormGroup;

export class ProjectService {      status: formValue.status,

    // Status options

    protected readonly statusOptions: ProjectStatus[] = ['Active', 'Completed', 'OnHold', 'Cancelled'];  private readonly http = inject(HttpClient);      priority: formValue.priority,

    protected readonly priorityOptions = [1, 2, 3, 4, 5];

  private readonly apiUrl = `${environment.apiUrl}/projects`;      startDate: formValue.startDate ? new Date(formValue.startDate) : null,

    constructor() {

        // Initialize form      dueDate: formValue.dueDate ? new Date(formValue.dueDate) : null

        this.form = this.fb.group({

            title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],  // State signals for pagination    };

            description: ['', [Validators.maxLength(1000)]],

            status: ['Active', [Validators.required]],  private readonly projects = signal<Project[]>([]);

            priority: [3, [Validators.required, Validators.min(1), Validators.max(5)]],

            startDate: [null],  private readonly loading = signal(false);    const operation$ = this.isEditMode()

            dueDate: [null]

        });  private readonly error = signal<string | null>(null);      ? this.projectService.updateProject(this.projectId()!, projectData)

    }

      : this.projectService.createProject(projectData);

    ngOnInit(): void {

        // Check if we're in edit mode  /// <summary>

        const id = this.route.snapshot.paramMap.get('id');

        if (id) {  /// Create a new project    operation$.subscribe({

            this.isEditMode.set(true);

            this.projectId.set(parseInt(id, 10));  /// </summary>      next: () => {

            this.loadProject(parseInt(id, 10));

        }  createProject(request: CreateProjectRequest): Observable<Project> {        this.notificationService.success(

    }

    return this.http.post<Project>(this.apiUrl, request).pipe(          'Success',

    /// <summary>

    /// Load project data for editing      tap(() => {          this.isEditMode() ? 'Project updated successfully' : 'Project created successfully'

    /// </summary>

    private loadProject(id: number): void {        this.error.set(null);        );

        this.loading.set(true);

        this.projectService.getProjectById(id).subscribe({      }),        this.loading.set(false);

            next: (project) => {

                this.form.patchValue({      catchError(error => {        this.router.navigate(['/projects']);

                    title: project.title,

                    description: project.description,        this.error.set('Failed to create project');      },

                    status: project.status,

                    priority: project.priority,        console.error('Error creating project:', error);      error: (error) => {

                    startDate: this.formatDateForInput(project.startDate),

                    dueDate: this.formatDateForInput(project.dueDate)        throw error;        console.error('Error saving project:', error);

                });

                this.loading.set(false);      })        this.notificationService.error(

            },

            error: (error) => {    );          'Error',

                console.error('Error loading project:', error);

                this.notificationService.error(  }          'Failed to save project. Please try again.'

                    'Error',

                    'Failed to load project data'        );

                );

                this.loading.set(false);  /// <summary>        this.loading.set(false);

                this.router.navigate(['/projects']);

            }  /// Get a single project by ID      }

        });

    }  /// </summary>    });



    /// <summary>  getProject(id: number): Observable<Project> {  }

    /// Format date for HTML input (YYYY-MM-DD)

    /// </summary>    return this.http.get<Project>(`${this.apiUrl}/${id}`);

    private formatDateForInput(date: Date | null): string | null {

        if (!date) return null;  }  /// <summary>

        const d = new Date(date);

        return d.toISOString().split('T')[0];  /// Cancel and go back

    }

  /// <summary>  /// </summary>

    /// <summary>

    /// Submit form  /// Update an existing project  cancel(): void {

    /// </summary>

    onSubmit(): void {  /// </summary>    if (this.form.dirty) {

        if (this.form.invalid) {

            this.form.markAllAsTouched();  updateProject(id: number, request: UpdateProjectRequest): Observable<void> {      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {

            this.notificationService.warning(

                'Validation Error',    return this.http.put<void>(`${this.apiUrl}/${id}`, request).pipe(        this.router.navigate(['/projects']);

                'Please fix the errors in the form'

            );      tap(() => {      }

            return;

        }        this.error.set(null);    } else {



        this.loading.set(true);      }),      this.router.navigate(['/projects']);

        const formValue = this.form.value;

      catchError(error => {    }

        // Convert date strings to Date objects

        const projectData: Partial<Project> = {        this.error.set('Failed to update project');  }

            title: formValue.title,

            description: formValue.description || null,        console.error('Error updating project:', error);

            status: formValue.status,

            priority: formValue.priority,        throw error;  /// <summary>

            startDate: formValue.startDate ? new Date(formValue.startDate) : null,

            dueDate: formValue.dueDate ? new Date(formValue.dueDate) : null      })  /// Check if field has error

        };

    );  /// </summary>

        const operation$ = this.isEditMode()

            ? this.projectService.updateProject(this.projectId()!, projectData)  }  hasError(fieldName: string, errorType?: string): boolean {

            : this.projectService.createProject(projectData);

    const field = this.form.get(fieldName);

        operation$.subscribe({

            next: () => {  /// <summary>    if (!field) return false;

                this.notificationService.success(

                    'Success',  /// Delete a project

                    this.isEditMode() ? 'Project updated successfully' : 'Project created successfully'

                );  /// </summary>    if (errorType) {

                this.loading.set(false);

                this.router.navigate(['/projects']);  deleteProject(id: number): Observable<void> {      return field.hasError(errorType) && (field.dirty || field.touched);

            },

            error: (error) => {    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(    }

                console.error('Error saving project:', error);

                this.notificationService.error(      tap(() => {    return field.invalid && (field.dirty || field.touched);

                    'Error',

                    'Failed to save project. Please try again.'        this.error.set(null);  }

                );

                this.loading.set(false);      }),

            }

        });      catchError(error => {  /// <summary>

    }

        this.error.set('Failed to delete project');  /// Get error message for field

    /// <summary>

    /// Cancel and go back        console.error('Error deleting project:', error);  /// </summary>

    /// </summary>

    cancel(): void {        throw error;  getErrorMessage(fieldName: string): string {

        if (this.form.dirty) {

            if (confirm('You have unsaved changes. Are you sure you want to leave?')) {      })    const field = this.form.get(fieldName);

                this.router.navigate(['/projects']);

            }    );    if (!field || !field.errors) return '';

        } else {

            this.router.navigate(['/projects']);  }

        }

    }    const errors = field.errors;



    /// <summary>  /// <summary>

    /// Check if field has error

    /// </summary>  /// Load paginated projects with optional filters    if (errors['required']) {

    hasError(fieldName: string, errorType?: string): boolean {

        const field = this.form.get(fieldName);  /// </summary>      return 'This field is required';

        if (!field) return false;

  loadProjectsPaged(filters?: Partial<PaginationParams>): Observable<ProjectPaginatedResponse> {    }

        if (errorType) {

            return field.hasError(errorType) && (field.dirty || field.touched);    this.loading.set(true);    if (errors['minlength']) {

        }

        return field.invalid && (field.dirty || field.touched);    this.error.set(null);      return `Minimum length is ${errors['minlength'].requiredLength} characters`;

    }

    }

    /// <summary>

    /// Get error message for field    let params = new HttpParams()    if (errors['maxlength']) {

    /// </summary>

    getErrorMessage(fieldName: string): string {      .set('pageNumber', (filters?.pageNumber ?? 1).toString())      return `Maximum length is ${errors['maxlength'].requiredLength} characters`;

        const field = this.form.get(fieldName);

        if (!field || !field.errors) return '';      .set('pageSize', (filters?.pageSize ?? 10).toString());    }



        const errors = field.errors;    if (errors['min']) {



        if (errors['required']) {    if (filters?.searchTerm) {      return `Minimum value is ${errors['min'].min}`;

            return 'This field is required';

        }      params = params.set('searchTerm', filters.searchTerm);    }



        if (errors['minlength']) {    }    if (errors['max']) {

            return `Minimum length is ${errors['minlength'].requiredLength} characters`;

        }    if (filters?.sortBy) {      return `Maximum value is ${errors['max'].max}`;



        if (errors['maxlength']) {      params = params.set('sortBy', filters.sortBy);    }

            return `Maximum length is ${errors['maxlength'].requiredLength} characters`;

        }    }



        if (errors['min']) {    if (filters?.sortDirection) {    return 'Invalid value';

            return `Minimum value is ${errors['min'].min}`;

        }      params = params.set('sortDirection', filters.sortDirection);  }



        if (errors['max']) {    }}

            return `Maximum value is ${errors['max'].max}`;

        }```



        return 'Invalid value';    return this.http.get<ProjectPaginatedResponse>(`${this.apiUrl}/paged`, { params }).pipe(

    }

}      tap(response => {Create file: `frontend/project-tracker/src/app/features/projects/components/project-form/project-form.component.html`

```

        this.projects.set(response.items);

---

        this.loading.set(false);```html

## 🔒 Security Considerations

      }),<div class="container py-4">

### Backend Security

      catchError(error => {  <div class="row justify-content-center">

1. **Authorization**: All endpoints require `[Authorize]` attribute

2. **Ownership Verification**: Every operation verifies user ownership        this.error.set('Failed to load projects');    <div class="col-lg-8">

   ```csharp

   if (project.UserId != userId)        this.loading.set(false);      <!-- Header -->

       return NotFound(new { message = "Project not found" });

   ```        console.error('Error loading projects:', error);      <div class="d-flex justify-content-between align-items-center mb-4">

3. **Input Validation**: DataAnnotations validate request models

4. **Logging**: All operations logged for audit trail        return of({        <div>



### Frontend Security          items: [],          <h2 class="mb-1">



1. **HTTP Interceptors**: (From Module 5) Add authentication headers          pageNumber: 1,            @if (isEditMode()) {

2. **Error Boundaries**: Graceful error handling

3. **User Confirmation**: Delete requires explicit confirmation          pageSize: 10,              <i class="fas fa-edit me-2"></i>

4. **Validation**: Client-side validation before submission

          totalCount: 0,              {{ 'projects.editProject' | translate }}

---

          totalPages: 0,            } @else {

## ✅ Summary

          hasPreviousPage: false,              <i class="fas fa-plus me-2"></i>

### Backend CRUD Operations

          hasNextPage: false              {{ 'projects.createProject' | translate }}

- ✅ **Create**: `POST /api/projects` - Creates new project with validation

- ✅ **Read**: `GET /api/projects/{id}` - Retrieves single project        });            }

- ✅ **Read**: `GET /api/projects/paged` - Retrieves paginated list with filters

- ✅ **Update**: `PUT /api/projects/{id}` - Updates existing project      })          </h2>

- ✅ **Delete**: `DELETE /api/projects/{id}` - Deletes project

    );          <p class="text-muted mb-0">

### Frontend CRUD Operations

  }            {{ isEditMode() ? ('projects.editProjectDesc' | translate) : ('projects.createProjectDesc' | translate) }}

- ✅ **Create**: Service method with HTTP POST

- ✅ **Read**: Service methods with HTTP GET and pagination support}          </p>

- ✅ **Update**: Service method with HTTP PUT

- ✅ **Delete**: Service method with HTTP DELETE and confirmation```        </div>



### Validation      </div>



- ✅ Server-side: DataAnnotations in request models**Key Features:**

- ✅ Client-side: Observable errors and state management

- ✅ Feedback: Error handling in components- ✅ All CRUD methods return observables      <!-- Form Card -->



### Best Practices Applied- ✅ Error handling with signal-based state      <div class="card shadow-sm">



- ✅ RESTful API design- ✅ Type-safe models        <div class="card-body p-4">

- ✅ Proper HTTP status codes (201 Created, 204 No Content, 404 Not Found)

- ✅ Owner verification on all operations- ✅ Automatic loading state management          <form [formGroup]="form" (ngSubmit)="onSubmit()">

- ✅ Structured logging and error handling

- ✅ Signal-based state management            <!-- Title -->

- ✅ Type-safe models and services

- ✅ User confirmation for destructive actions### Project List Component - Delete Operation            <div class="mb-3">

- ✅ Pagination and filtering support

              <label for="title" class="form-label">

---

**File: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.ts`**                {{ 'projects.projectName' | translate }}

**Next: [Module 12: Bootstrap UI & Styling](./12_bootstrap_ui.md)**

                <span class="text-danger">*</span>

The project list component demonstrates the **Delete** operation:              </label>

              <input

```typescript                type="text"

/// <summary>                id="title"

/// Delete project with confirmation                class="form-control"

/// </summary>                formControlName="title"

deleteProject(project: Project): void {                [class.is-invalid]="hasError('title')"

  if (confirm(`Are you sure you want to delete "${project.title}"?`)) {                [placeholder]="'projects.projectNamePlaceholder' | translate">

    this.projectService.deleteProject(project.id).subscribe({              @if (hasError('title')) {

      next: () => {                <div class="invalid-feedback">

        this.loadProjects();                  {{ getErrorMessage('title') }}

      },                </div>

      error: (error) => {              }

        console.error('Delete failed:', error);            </div>

      }

    });            <!-- Description -->

  }            <div class="mb-3">

}              <label for="description" class="form-label">

```                {{ 'projects.description' | translate }}

              </label>

**Template Delete Button:**              <textarea

                id="description"

```html                class="form-control"

<button                formControlName="description"

  type="button"                rows="4"

  class="btn btn-outline-danger"                [class.is-invalid]="hasError('description')"

  (click)="deleteProject(project)"                [placeholder]="'projects.descriptionPlaceholder' | translate">

  title="{{ 'common.delete' | translate }}">              </textarea>

  <i class="fas fa-trash"></i>              @if (hasError('description')) {

</button>                <div class="invalid-feedback">

```                  {{ getErrorMessage('description') }}

                </div>

**Key Features:**              }

- ✅ User confirmation before deletion              <div class="form-text">

- ✅ Reloads the list after successful deletion                {{ form.get('description')?.value?.length || 0 }} / 1000 {{ 'common.characters' | translate }}

- ✅ Error handling              </div>

- ✅ Icon-based UI using FontAwesome            </div>



---            <!-- Status and Priority Row -->

            <div class="row">

## 🚀 Workflow: Create, Read, Update, Delete              <div class="col-md-6 mb-3">

                <label for="status" class="form-label">

### Create Workflow                  {{ 'projects.status' | translate }}

                  <span class="text-danger">*</span>

1. User clicks "Add Project" button                </label>

2. Navigates to `/projects/create`                <select

3. Form component loads in create mode                  id="status"

4. User fills form and submits                  class="form-select"

5. `ProjectService.createProject()` sends POST to backend                  formControlName="status"

6. Backend validates and creates project                  [class.is-invalid]="hasError('status')">

7. Success notification shown                  @for (status of statusOptions; track status) {

8. Redirects to projects list                    <option [value]="status">

                      {{ 'projects.status_' + status | translate }}

### Read Workflow                    </option>

                  }

1. Project list loads paginated projects via `GET /api/projects/paged`                </select>

2. Each project displayed in table                @if (hasError('status')) {

3. User can search, filter, sort                  <div class="invalid-feedback">

4. User clicks view icon to see project details                    {{ getErrorMessage('status') }}

5. `ProjectService.getProject(id)` fetches single project via `GET /api/projects/{id}`                  </div>

                }

### Update Workflow              </div>



1. User clicks edit icon on project row              <div class="col-md-6 mb-3">

2. Navigates to `/projects/{id}/edit`                <label for="priority" class="form-label">

3. Form loads in edit mode and populates data via `getProject(id)`                  {{ 'projects.priority' | translate }}

4. User modifies form fields                  <span class="text-danger">*</span>

5. User submits                </label>

6. `ProjectService.updateProject()` sends PUT to backend                <select

7. Backend validates and updates                  id="priority"

8. Success notification shown                  class="form-select"

9. Redirects to projects list                  formControlName="priority"

                  [class.is-invalid]="hasError('priority')">

### Delete Workflow                  @for (priority of priorityOptions; track priority) {

                    <option [value]="priority">

1. User clicks delete icon                      {{ priority }} - {{ 'projects.priority_' + priority | translate }}

2. Confirmation dialog shown with project title                    </option>

3. On confirm: `ProjectService.deleteProject(id)` sends DELETE to backend                  }

4. Backend verifies ownership and deletes                </select>

5. List reloads                @if (hasError('priority')) {

6. Success notification shown                  <div class="invalid-feedback">

                    {{ getErrorMessage('priority') }}

---                  </div>

                }

## 🔒 Security Considerations              </div>

            </div>

### Backend Security

            <!-- Dates Row -->

1. **Authorization**: All endpoints require `[Authorize]` attribute            <div class="row">

2. **Ownership Verification**: Every operation verifies user ownership              <div class="col-md-6 mb-3">

   ```csharp                <label for="startDate" class="form-label">

   if (project.UserId != userId)                  {{ 'projects.startDate' | translate }}

       return NotFound(new { message = "Project not found" });                </label>

   ```                <input

3. **Input Validation**: DataAnnotations validate request models                  type="date"

4. **Logging**: All operations logged for audit trail                  id="startDate"

                  class="form-control"

### Frontend Security                  formControlName="startDate"

                  [class.is-invalid]="hasError('startDate')">

1. **HTTP Interceptors**: (From Module 5) Add authentication headers                @if (hasError('startDate')) {

2. **Error Boundaries**: Graceful error handling                  <div class="invalid-feedback">

3. **User Confirmation**: Delete requires explicit confirmation                    {{ getErrorMessage('startDate') }}

4. **Validation**: Client-side validation before submission                  </div>

                }

---              </div>



## ✅ Summary              <div class="col-md-6 mb-3">

                <label for="dueDate" class="form-label">

### **Backend CRUD Operations:**                  {{ 'projects.dueDate' | translate }}

                </label>

- ✅ **Create**: `POST /api/projects` - Creates new project with validation                <input

- ✅ **Read**: `GET /api/projects/{id}` - Retrieves single project                  type="date"

- ✅ **Read**: `GET /api/projects/paged` - Retrieves paginated list with filters                  id="dueDate"

- ✅ **Update**: `PUT /api/projects/{id}` - Updates existing project                  class="form-control"

- ✅ **Delete**: `DELETE /api/projects/{id}` - Deletes project                  formControlName="dueDate"

                  [class.is-invalid]="hasError('dueDate')">

### **Frontend CRUD Operations:**                @if (hasError('dueDate')) {

                  <div class="invalid-feedback">

- ✅ **Create**: Service method with HTTP POST                    {{ getErrorMessage('dueDate') }}

- ✅ **Read**: Service methods with HTTP GET and pagination support                  </div>

- ✅ **Update**: Service method with HTTP PUT                }

- ✅ **Delete**: Service method with HTTP DELETE and confirmation              </div>

            </div>

### **Validation:**

            <!-- Required Fields Notice -->

- ✅ Server-side: DataAnnotations in request models            <div class="alert alert-info mb-3">

- ✅ Client-side: Observable errors and state management              <i class="fas fa-info-circle me-2"></i>

- ✅ Feedback: Error handling in components              <span class="text-danger">*</span> {{ 'common.requiredFields' | translate }}

            </div>

### **Best Practices Applied:**

            <!-- Form Actions -->

- ✅ RESTful API design            <div class="d-flex justify-content-end gap-2">

- ✅ Proper HTTP status codes (201 Created, 204 No Content, 404 Not Found)              <button

- ✅ Owner verification on all operations                type="button"

- ✅ Structured logging and error handling                class="btn btn-outline-secondary"

- ✅ Signal-based state management                (click)="cancel()"

- ✅ Type-safe models and services                [disabled]="loading()">

- ✅ User confirmation for destructive actions                <i class="fas fa-times me-2"></i>

- ✅ Pagination and filtering support                {{ 'common.cancel' | translate }}

              </button>

### **Next Steps - To Implement:**              <button

                type="submit"

- Create/Update form component using ProjectFormComponent pattern                class="btn btn-primary"

- Add toast notifications (NotificationService & ToastContainerComponent)                [disabled]="loading() || form.invalid">

- Create reusable delete confirmation modal (ConfirmDialogComponent)                @if (loading()) {

- Integrate form with routing and page navigation                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>

- Add comprehensive validation with user feedback                  {{ 'common.saving' | translate }}

                } @else {

---                  <i class="fas fa-save me-2"></i>

                  {{ isEditMode() ? ('common.update' | translate) : ('common.create' | translate) }}

**Next: [Module 12: Bootstrap UI & Styling](./12_bootstrap_ui.md)**                }

              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Form Debug (Development Only) -->
      @if (false) {
        <div class="card mt-3">
          <div class="card-body">
            <h6>Form Debug</h6>
            <pre>{{ form.value | json }}</pre>
            <p>Valid: {{ form.valid }}</p>
            <p>Dirty: {{ form.dirty }}</p>
            <p>Touched: {{ form.touched }}</p>
          </div>
        </div>
      }
    </div>
  </div>
</div>
```

Create file: `frontend/project-tracker/src/app/features/projects/components/project-form/project-form.component.css`

```css
.card {
  border-radius: 8px;
}

.form-label {
  font-weight: 500;
  color: var(--bs-secondary);
  margin-bottom: 0.5rem;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
}

.btn {
  min-width: 100px;
}

h2 {
  font-weight: 600;
  color: var(--bs-dark);
}
```

---

## 🗑️ Step 3: Delete Confirmation Modal

Create file: `frontend/project-tracker/src/app/shared/components/confirm-dialog/confirm-dialog.component.ts`

```typescript
import { Component, output, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

/// <summary>
/// Reusable confirmation dialog component
/// </summary>
@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  // Inputs
  readonly show = input.required<boolean>();
  readonly title = input<string>('Confirm');
  readonly message = input<string>('Are you sure?');
  readonly confirmText = input<string>('Confirm');
  readonly cancelText = input<string>('Cancel');
  readonly confirmButtonClass = input<string>('btn-danger');
  readonly loading = input<boolean>(false);

  // Outputs
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  /// <summary>
  /// Confirm action
  /// </summary>
  confirm(): void {
    if (!this.loading()) {
      this.confirmed.emit();
    }
  }

  /// <summary>
  /// Cancel action
  /// </summary>
  cancel(): void {
    if (!this.loading()) {
      this.cancelled.emit();
    }
  }
}
```

Create file: `frontend/project-tracker/src/app/shared/components/confirm-dialog/confirm-dialog.component.html`

```html
@if (show()) {
  <!-- Modal Backdrop -->
  <div class="modal-backdrop fade show"></div>

  <!-- Modal -->
  <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-exclamation-triangle text-warning me-2"></i>
            {{ title() }}
          </h5>
          @if (!loading()) {
            <button
              type="button"
              class="btn-close"
              (click)="cancel()"
              [attr.aria-label]="'common.close' | translate">
            </button>
          }
        </div>

        <!-- Body -->
        <div class="modal-body">
          <p class="mb-0">{{ message() }}</p>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-secondary"
            (click)="cancel()"
            [disabled]="loading()">
            {{ cancelText() }}
          </button>
          <button
            type="button"
            [class]="'btn ' + confirmButtonClass()"
            (click)="confirm()"
            [disabled]="loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ 'common.processing' | translate }}
            } @else {
              {{ confirmText() }}
            }
          </button>
        </div>
      </div>
    </div>
  </div>
}
```

Create file: `frontend/project-tracker/src/app/shared/components/confirm-dialog/confirm-dialog.component.css`

```css
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.3);
}

.modal-title {
  font-weight: 600;
}
```

---

## 🔄 Step 4: Update Project List with Delete Modal

Update file: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.ts`

Add the following to use the confirm dialog:

```typescript
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

export class ProjectListComponent implements OnInit {
  // ... existing code ...

  // Delete confirmation state
  protected readonly showDeleteConfirm = signal(false);
  protected readonly projectToDelete = signal<Project | null>(null);
  protected readonly deleting = signal(false);

  /// <summary>
  /// Show delete confirmation
  /// </summary>
  deleteProject(project: Project): void {
    this.projectToDelete.set(project);
    this.showDeleteConfirm.set(true);
  }

  /// <summary>
  /// Confirm delete
  /// </summary>
  confirmDelete(): void {
    const project = this.projectToDelete();
    if (!project) return;

    this.deleting.set(true);
    this.projectService.deleteProject(project.id).subscribe({
      next: () => {
        this.notificationService.success(
          'Success',
          `Project "${project.title}" deleted successfully`
        );
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
        this.projectToDelete.set(null);
        this.loadProjects();
      },
      error: (error) => {
        console.error('Delete failed:', error);
        this.notificationService.error(
          'Error',
          'Failed to delete project'
        );
        this.deleting.set(false);
      }
    });
  }

  /// <summary>
  /// Cancel delete
  /// </summary>
  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.projectToDelete.set(null);
  }
}
```

Update the component imports:

```typescript
imports: [
  CommonModule, 
  ProjectFiltersComponent, 
  ProjectTableComponent, 
  PaginationComponent,
  ConfirmDialogComponent,
  TranslatePipe
],
```

Update file: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.html`

Add the confirm dialog at the end:

```html
<!-- ... existing template ... -->

<!-- Delete Confirmation Modal -->
<app-confirm-dialog
  [show]="showDeleteConfirm()"
  [title]="'common.confirmDelete' | translate"
  [message]="'Are you sure you want to delete project: ' + projectToDelete()?.title + '?'"
  [confirmText]="'common.delete' | translate"
  [cancelText]="'common.cancel' | translate"
  confirmButtonClass="btn-danger"
  [loading]="deleting()"
  (confirmed)="confirmDelete()"
  (cancelled)="cancelDelete()">
</app-confirm-dialog>
```

---

## 🛣️ Step 5: Update Routes

Update your routing module to include the form routes:

```typescript
// In app.routes.ts or projects.routes.ts
{
  path: 'projects',
  children: [
    {
      path: '',
      component: ProjectListComponent
    },
    {
      path: 'create',
      component: ProjectFormComponent
    },
    {
      path: ':id/edit',
      component: ProjectFormComponent
    },
    {
      path: ':id',
      component: ProjectDetailComponent // Optional: view-only detail page
    }
  ]
}
```

---

## ✅ Summary

### **What We Built:**

1. ✅ **Toast Notification Service**
   - NotificationService with success/error/warning/info methods
   - ToastContainerComponent with auto-dismiss
   - Signal-based state management
   - Customizable duration

2. ✅ **Project Form Component**
   - Single component for create/edit (isEditMode signal)
   - Reactive forms with validators
   - Real-time validation feedback
   - Character counter for description
   - Loading states during save
   - Unsaved changes warning

3. ✅ **Delete Confirmation Modal**
   - Reusable ConfirmDialogComponent
   - Loading state during delete
   - Customizable text and buttons
   - Modal backdrop

4. ✅ **Integrated CRUD Operations**
   - Create new projects
   - Edit existing projects
   - Delete with confirmation
   - Success/error notifications
   - Proper error handling

### **Validation Features:**
- ✅ Required fields validation
- ✅ Min/max length validation
- ✅ Min/max value validation
- ✅ Show errors only when touched/dirty
- ✅ Mark all as touched on submit
- ✅ Disable submit when invalid

### **Best Practices Applied:**
- ✅ Single form component for create/edit
- ✅ Signal-based state management
- ✅ FormBuilder for type safety
- ✅ Reactive forms over template-driven
- ✅ Reusable modal component
- ✅ Toast notifications instead of alerts
- ✅ Loading states for async operations
- ✅ Confirmation before destructive actions
- ✅ OnPush change detection

### **Production Enhancements (Optional):**
- Add async validators (e.g., unique title check)
- Implement form autosave
- Add custom date range validator (start before due)
- Use NgRx for global state
- Add form dirty check with CanDeactivate guard
- Implement optimistic UI updates

---

**Next: [Module 12: Bootstrap UI & Styling](./12_bootstrap_ui.md)**
