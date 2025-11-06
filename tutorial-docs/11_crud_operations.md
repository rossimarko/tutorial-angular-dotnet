# Module 11: CRUD Operations - Create, Update & Delete# Module 11: CRUD Operations - Create, Update & Delete# Module 11: Add, Edit & Delete Operations



## 🎯 Objectives



By the end of this module, you will understand:## 🎯 Objectives## 🎯 Objectives



- ✅ Backend CRUD operations with ASP.NET Core Controllers

- ✅ Frontend CRUD operations with Angular Services

- ✅ Project creation and editing functionalityBy the end of this module, you will:- ✅ Create form component

- ✅ Project deletion with confirmation

- ✅ Server-side and client-side validation- ✅ Build reactive forms with validation- ✅ Update form component

- ✅ Error handling and user feedback

- ✅ Toast notifications for success/error messages- ✅ Create and edit projects with the same component- ✅ Delete confirmation



---- ✅ Implement client-side and server-side validation- ✅ Validation (client & server)



## 📋 What is CRUD?- ✅ Add async validators for unique fields- ✅ Error handling



**CRUD** stands for the four basic database operations:- ✅ Create delete confirmation modals- ✅ Success notifications



- **C**reate: Add new records- ✅ Build a toast notification service

- **R**ead: Retrieve/display records (covered in Modules 9-10)

- **U**pdate: Modify existing records- ✅ Handle form errors gracefully## 📌 Status: Framework Ready

- **D**elete: Remove records

- ✅ Manage form state (pristine, dirty, touched)

This module demonstrates how both the backend API and Angular frontend implement these operations together.

Implement:

---

## 📋 What is CRUD?- [ ] Project form (create/edit)

## 🔙 Backend: ASP.NET Core CRUD Operations

- [ ] Reactive form validation

### Project Controller Overview

**CRUD** stands for the four basic database operations:- [ ] Async validation

The `ProjectsController` in the backend implements all CRUD operations with proper authorization, validation, and error handling.

- **C**reate: Add new records- [ ] Delete confirmation modal

**File: `backend/ProjectTracker.API/Controllers/ProjectsController.cs`**

- **R**ead: Retrieve/display records (covered in Modules 9-10)- [ ] Success/error toast notifications

```csharp

[ApiController]- **U**pdate: Modify existing records- [ ] Form state management

[Route("api/[controller]")]

[Authorize]- **D**elete: Remove records

public class ProjectsController : ControllerBase

{---

    private readonly IProjectRepository _projectRepository;

    private readonly ILogger<ProjectsController> _logger;### Form Best Practices:



    public ProjectsController(- **Reactive Forms**: Type-safe, testable, composable**Next: [Module 12: Bootstrap UI](./12_bootstrap_ui.md)**

        IProjectRepository projectRepository,

        ILogger<ProjectsController> logger)- **Validation**: Prevent invalid data at submission

    {- **User Feedback**: Clear error messages, success notifications

        _projectRepository = projectRepository;- **Confirmation**: Ask before destructive actions (delete)

        _logger = logger;- **Loading States**: Disable form during API calls

    }

---

    // CRUD methods follow...

}## 📝 Step 1: Toast Notification Service

```

First, let's create a service to show success/error notifications.

### Backend Request/Response Models

Create file: `frontend/project-tracker/src/app/shared/services/notification.service.ts`

#### Create Project Request

```typescript

**File: `backend/ProjectTracker.API/Models/Requests/CreateProjectRequest.cs`**import { Injectable, signal } from '@angular/core';



```csharp/// <summary>

using System.ComponentModel.DataAnnotations;/// Toast notification type

/// </summary>

namespace ProjectTracker.API.Models.Requests;export type NotificationType = 'success' | 'error' | 'warning' | 'info';



/// <summary>/// <summary>

/// Request model for creating a new project/// Toast notification model

/// </summary>/// </summary>

public class CreateProjectRequestexport interface Toast {

{  id: number;

    [Required(ErrorMessage = "Title is required")]  type: NotificationType;

    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]  title: string;

    public required string Title { get; set; }  message: string;

  duration: number;

    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]}

    public string? Description { get; set; }

/// <summary>

    [StringLength(50)]/// Service for displaying toast notifications

    public string Status { get; set; } = "Active";/// </summary>

@Injectable({

    [Range(1, 5, ErrorMessage = "Priority must be between 1 and 5")]  providedIn: 'root'

    public int Priority { get; set; } = 1;})

export class NotificationService {

    public DateTime? StartDate { get; set; }  private readonly toasts = signal<Toast[]>([]);

    public DateTime? DueDate { get; set; }  private nextId = 1;

}

```  /// <summary>

  /// Get current toasts as readonly signal

#### Update Project Request  /// </summary>

  getToasts() {

**File: `backend/ProjectTracker.API/Models/Requests/UpdateProjectRequest.cs`**    return this.toasts.asReadonly();

  }

```csharp

using System.ComponentModel.DataAnnotations;  /// <summary>

  /// Show success notification

namespace ProjectTracker.API.Models.Requests;  /// </summary>

  success(title: string, message: string, duration: number = 3000): void {

/// <summary>    this.show('success', title, message, duration);

/// Request model for updating an existing project  }

/// </summary>

public class UpdateProjectRequest  /// <summary>

{  /// Show error notification

    [Required(ErrorMessage = "Title is required")]  /// </summary>

    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]  error(title: string, message: string, duration: number = 5000): void {

    public required string Title { get; set; }    this.show('error', title, message, duration);

  }

    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]

    public string? Description { get; set; }  /// <summary>

  /// Show warning notification

    [StringLength(50)]  /// </summary>

    public string Status { get; set; } = "Active";  warning(title: string, message: string, duration: number = 4000): void {

    this.show('warning', title, message, duration);

    [Range(1, 5, ErrorMessage = "Priority must be between 1 and 5")]  }

    public int Priority { get; set; } = 1;

  /// <summary>

    public DateTime? StartDate { get; set; }  /// Show info notification

    public DateTime? DueDate { get; set; }  /// </summary>

}  info(title: string, message: string, duration: number = 3000): void {

```    this.show('info', title, message, duration);

  }

#### Project Response

  /// <summary>

**File: `backend/ProjectTracker.API/Models/Responses/ProjectResponse.cs`**  /// Show notification

  /// </summary>

```csharp  private show(type: NotificationType, title: string, message: string, duration: number): void {

namespace ProjectTracker.API.Models.Responses;    const toast: Toast = {

      id: this.nextId++,

/// <summary>      type,

/// Response model for project data      title,

/// </summary>      message,

public class ProjectResponse      duration

{    };

    public int Id { get; set; }

    public int UserId { get; set; }    this.toasts.update(toasts => [...toasts, toast]);

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }    // Auto-remove after duration

    public string Status { get; set; } = "Active";    if (duration > 0) {

    public int Priority { get; set; } = 1;      setTimeout(() => this.remove(toast.id), duration);

    public DateTime? StartDate { get; set; }    }

    public DateTime? DueDate { get; set; }  }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }  /// <summary>

}  /// Remove notification by ID

```  /// </summary>

  remove(id: number): void {

### Backend CRUD Endpoints    this.toasts.update(toasts => toasts.filter(t => t.id !== id));

  }

#### Create - POST /api/projects

  /// <summary>

```csharp  /// Clear all notifications

/// <summary>  /// </summary>

/// Create a new project  clear(): void {

/// POST: api/projects    this.toasts.set([]);

/// </summary>  }

[HttpPost]}

[ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status201Created)]```

[ProducesResponseType(StatusCodes.Status400BadRequest)]

public async Task<ActionResult<ProjectResponse>> Create([FromBody] CreateProjectRequest request)Create file: `frontend/project-tracker/src/app/shared/components/toast-container/toast-container.component.ts`

{

    var userId = GetUserId();```typescript

    _logger.LogInformation("Creating new project for user {UserId}", userId);import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { CommonModule } from '@angular/common';

    var project = new Projectimport { NotificationService, NotificationType } from '../../services/notification.service';

    {import { TranslatePipe } from '../../pipes/translate.pipe';

        UserId = userId,

        Title = request.Title,/// <summary>

        Description = request.Description,/// Container component for displaying toast notifications

        Status = request.Status,/// </summary>

        Priority = request.Priority,@Component({

        StartDate = request.StartDate,  selector: 'app-toast-container',

        DueDate = request.DueDate  imports: [CommonModule, TranslatePipe],

    };  templateUrl: './toast-container.component.html',

  styleUrl: './toast-container.component.css',

    var id = await _projectRepository.CreateAsync(project);  changeDetection: ChangeDetectionStrategy.OnPush

    project.Id = id;})

export class ToastContainerComponent {

    _logger.LogInformation("Created project {ProjectId} for user {UserId}", id, userId);  private readonly notificationService = inject(NotificationService);

  

    return CreatedAtAction(  protected readonly toasts = this.notificationService.getToasts();

        nameof(GetById),

        new { id },  /// <summary>

        MapToResponse(project));  /// Get Bootstrap class for toast type

}  /// </summary>

```  getToastClass(type: NotificationType): string {

    const classes: Record<NotificationType, string> = {

**Key Features:**      success: 'bg-success text-white',

- ✅ Server-side validation via `DataAnnotations`      error: 'bg-danger text-white',

- ✅ User ID extraction from JWT claims      warning: 'bg-warning text-dark',

- ✅ Returns 201 Created with Location header      info: 'bg-info text-white'

- ✅ Structured logging    };

    return classes[type];

#### Read - GET /api/projects/{id}  }



```csharp  /// <summary>

/// <summary>  /// Get icon for toast type

/// Get a specific project by ID  /// </summary>

/// GET: api/projects/{id}  getToastIcon(type: NotificationType): string {

/// </summary>    const icons: Record<NotificationType, string> = {

[HttpGet("{id}")]      success: 'fas fa-check-circle',

[ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status200OK)]      error: 'fas fa-exclamation-circle',

[ProducesResponseType(StatusCodes.Status404NotFound)]      warning: 'fas fa-exclamation-triangle',

public async Task<ActionResult<ProjectResponse>> GetById(int id)      info: 'fas fa-info-circle'

{    };

    var userId = GetUserId();    return icons[type];

    _logger.LogInformation("Fetching project {ProjectId} for user {UserId}", id, userId);  }



    var project = await _projectRepository.GetByIdAsync(id);  /// <summary>

  /// Close toast

    if (project is null || project.UserId != userId)  /// </summary>

    {  close(id: number): void {

        return NotFound(new { message = "Project not found" });    this.notificationService.remove(id);

    }  }

}

    return Ok(MapToResponse(project));```

}

```Create file: `frontend/project-tracker/src/app/shared/components/toast-container/toast-container.component.html`



**Key Features:**```html

- ✅ User ownership verification<div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;">

- ✅ 404 Not Found for missing or unauthorized projects  @for (toast of toasts(); track toast.id) {

    <div

#### Update - PUT /api/projects/{id}      class="toast show mb-2"

      [class]="getToastClass(toast.type)"

```csharp      role="alert"

/// <summary>      aria-live="assertive"

/// Update an existing project      aria-atomic="true">

/// PUT: api/projects/{id}      <div class="toast-header" [class]="getToastClass(toast.type)">

/// </summary>        <i [class]="getToastIcon(toast.type) + ' me-2'"></i>

[HttpPut("{id}")]        <strong class="me-auto">{{ toast.title }}</strong>

[ProducesResponseType(StatusCodes.Status204NoContent)]        <button

[ProducesResponseType(StatusCodes.Status400BadRequest)]          type="button"

[ProducesResponseType(StatusCodes.Status404NotFound)]          class="btn-close btn-close-white"

public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectRequest request)          (click)="close(toast.id)"

{          [attr.aria-label]="'common.close' | translate">

    var userId = GetUserId();        </button>

    _logger.LogInformation("Updating project {ProjectId} for user {UserId}", id, userId);      </div>

      <div class="toast-body">

    var existing = await _projectRepository.GetByIdAsync(id);        {{ toast.message }}

    if (existing is null || existing.UserId != userId)      </div>

    {    </div>

        return NotFound(new { message = "Project not found" });  }

    }</div>

```

    existing.Title = request.Title;

    existing.Description = request.Description;Create file: `frontend/project-tracker/src/app/shared/components/toast-container/toast-container.component.css`

    existing.Status = request.Status;

    existing.Priority = request.Priority;```css

    existing.StartDate = request.StartDate;.toast {

    existing.DueDate = request.DueDate;  min-width: 300px;

  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);

    await _projectRepository.UpdateAsync(existing);}



    _logger.LogInformation("Updated project {ProjectId}", id);.toast-header {

  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    return NoContent();}

}

```.btn-close-white {

  filter: invert(1) grayscale(100%) brightness(200%);

**Key Features:**}

- ✅ Ownership verification before update```

- ✅ Returns 204 No Content

- ✅ Automatic timestamp updates in repositoryAdd ToastContainer to your main app component template:



#### Delete - DELETE /api/projects/{id}```html

<!-- In app.component.html -->

```csharp<app-toast-container></app-toast-container>

/// <summary><router-outlet></router-outlet>

/// Delete a project```

/// DELETE: api/projects/{id}

/// </summary>---

[HttpDelete("{id}")]

[ProducesResponseType(StatusCodes.Status204NoContent)]## 📋 Step 2: Project Form Component

[ProducesResponseType(StatusCodes.Status404NotFound)]

public async Task<IActionResult> Delete(int id)Create file: `frontend/project-tracker/src/app/features/projects/components/project-form/project-form.component.ts`

{

    var userId = GetUserId();```typescript

    _logger.LogInformation("Deleting project {ProjectId} for user {UserId}", id, userId);import { Component, inject, signal, OnInit, input, ChangeDetectionStrategy } from '@angular/core';

import { CommonModule } from '@angular/common';

    var existing = await _projectRepository.GetByIdAsync(id);import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

    if (existing is null || existing.UserId != userId)import { Router, ActivatedRoute } from '@angular/router';

    {import { ProjectService } from '../../services/project.service';

        return NotFound(new { message = "Project not found" });import { NotificationService } from '../../../../shared/services/notification.service';

    }import { Project, ProjectStatus } from '../../../../shared/models/project.model';

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

    await _projectRepository.DeleteAsync(id);

/// <summary>

    _logger.LogInformation("Deleted project {ProjectId}", id);/// Form component for creating and editing projects

/// Uses same component for both create and edit modes

    return NoContent();/// </summary>

}@Component({

```  selector: 'app-project-form',

  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],

**Key Features:**  templateUrl: './project-form.component.html',

- ✅ Owner verification  styleUrl: './project-form.component.css',

- ✅ Returns 204 No Content  changeDetection: ChangeDetectionStrategy.OnPush

- ✅ Audit logging})

export class ProjectFormComponent implements OnInit {

---  private readonly fb = inject(FormBuilder);

  private readonly projectService = inject(ProjectService);

## 🎨 Frontend: Angular CRUD Operations  private readonly notificationService = inject(NotificationService);

  private readonly router = inject(Router);

### Project Models  private readonly route = inject(ActivatedRoute);



**File: `frontend/project-tracker/src/app/shared/models/project.model.ts`**  // Signals for component state

  protected readonly isEditMode = signal(false);

```typescript  protected readonly loading = signal(false);

/// <summary>  protected readonly projectId = signal<number | null>(null);

/// Project entity model

/// </summary>  // Form

export interface Project {  protected readonly form: FormGroup;

  id: number;

  userId: number;  // Status options

  title: string;  protected readonly statusOptions: ProjectStatus[] = ['Active', 'Completed', 'OnHold', 'Cancelled'];

  description?: string;  protected readonly priorityOptions = [1, 2, 3, 4, 5];

  status: string;

  priority: number;  constructor() {

  startDate?: Date;    // Initialize form

  dueDate?: Date;    this.form = this.fb.group({

  createdAt: Date;      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],

  updatedAt: Date;      description: ['', [Validators.maxLength(1000)]],

}      status: ['Active', [Validators.required]],

      priority: [3, [Validators.required, Validators.min(1), Validators.max(5)]],

/// <summary>      startDate: [null],

/// Request to create a new project      dueDate: [null]

/// </summary>    });

export interface CreateProjectRequest {  }

  title: string;

  description?: string;  ngOnInit(): void {

  status: string;    // Check if we're in edit mode

  priority: number;    const id = this.route.snapshot.paramMap.get('id');

  startDate?: Date;    if (id) {

  dueDate?: Date;      this.isEditMode.set(true);

}      this.projectId.set(parseInt(id, 10));

      this.loadProject(parseInt(id, 10));

/// <summary>    }

/// Request to update an existing project  }

/// </summary>

export interface UpdateProjectRequest extends CreateProjectRequest {}  /// <summary>

  /// Load project data for editing

/// <summary>  /// </summary>

/// Paged result wrapper - matches backend response structure  private loadProject(id: number): void {

/// </summary>    this.loading.set(true);

export interface PaginatedResponse<T> {    this.projectService.getProjectById(id).subscribe({

  pageNumber: number;      next: (project) => {

  pageSize: number;        this.form.patchValue({

  totalCount: number;          title: project.title,

  totalPages: number;          description: project.description,

  hasNextPage: boolean;          status: project.status,

  hasPreviousPage: boolean;          priority: project.priority,

  items: T[];          startDate: this.formatDateForInput(project.startDate),

}          dueDate: this.formatDateForInput(project.dueDate)

        });

/// <summary>        this.loading.set(false);

/// Project-specific pagination type      },

/// </summary>      error: (error) => {

export type ProjectPaginatedResponse = PaginatedResponse<Project>;        console.error('Error loading project:', error);

        this.notificationService.error(

/// <summary>          'Error',

/// Pagination parameters for API requests          'Failed to load project data'

/// </summary>        );

export interface PaginationParams {        this.loading.set(false);

  pageNumber: number;        this.router.navigate(['/projects']);

  pageSize: number;      }

  searchTerm?: string;    });

  sortBy?: string;  }

  sortDirection?: 'asc' | 'desc';

}  /// <summary>

```  /// Format date for HTML input (YYYY-MM-DD)

  /// </summary>

### Project Service  private formatDateForInput(date: Date | null): string | null {

    if (!date) return null;

**File: `frontend/project-tracker/src/app/features/projects/services/project.service.ts`**    const d = new Date(date);

    return d.toISOString().split('T')[0];

The service manages all CRUD operations and state using signals:  }



```typescript  /// <summary>

import { Injectable, inject, signal } from '@angular/core';  /// Submit form

import { HttpClient, HttpParams } from '@angular/common/http';  /// </summary>

import { Observable, tap, catchError, of } from 'rxjs';  onSubmit(): void {

import { environment } from '../../../../environments/environment';    if (this.form.invalid) {

import {       this.form.markAllAsTouched();

  Project,       this.notificationService.warning(

  ProjectPaginatedResponse,        'Validation Error',

  PaginationParams,        'Please fix the errors in the form'

  CreateProjectRequest,      );

  UpdateProjectRequest      return;

} from '../../../shared/models/project.model';    }



/// <summary>    this.loading.set(true);

/// Service for managing projects with pagination support    const formValue = this.form.value;

/// Uses signals for state management and server-side pagination

/// </summary>    // Convert date strings to Date objects

@Injectable({    const projectData: Partial<Project> = {

  providedIn: 'root'      title: formValue.title,

})      description: formValue.description || null,

export class ProjectService {      status: formValue.status,

  private readonly http = inject(HttpClient);      priority: formValue.priority,

  private readonly apiUrl = `${environment.apiUrl}/projects`;      startDate: formValue.startDate ? new Date(formValue.startDate) : null,

      dueDate: formValue.dueDate ? new Date(formValue.dueDate) : null

  // State signals for pagination    };

  private readonly projects = signal<Project[]>([]);

  private readonly loading = signal(false);    const operation$ = this.isEditMode()

  private readonly error = signal<string | null>(null);      ? this.projectService.updateProject(this.projectId()!, projectData)

      : this.projectService.createProject(projectData);

  /// <summary>

  /// Create a new project    operation$.subscribe({

  /// </summary>      next: () => {

  createProject(request: CreateProjectRequest): Observable<Project> {        this.notificationService.success(

    return this.http.post<Project>(this.apiUrl, request).pipe(          'Success',

      tap(() => {          this.isEditMode() ? 'Project updated successfully' : 'Project created successfully'

        this.error.set(null);        );

      }),        this.loading.set(false);

      catchError(error => {        this.router.navigate(['/projects']);

        this.error.set('Failed to create project');      },

        console.error('Error creating project:', error);      error: (error) => {

        throw error;        console.error('Error saving project:', error);

      })        this.notificationService.error(

    );          'Error',

  }          'Failed to save project. Please try again.'

        );

  /// <summary>        this.loading.set(false);

  /// Get a single project by ID      }

  /// </summary>    });

  getProject(id: number): Observable<Project> {  }

    return this.http.get<Project>(`${this.apiUrl}/${id}`);

  }  /// <summary>

  /// Cancel and go back

  /// <summary>  /// </summary>

  /// Update an existing project  cancel(): void {

  /// </summary>    if (this.form.dirty) {

  updateProject(id: number, request: UpdateProjectRequest): Observable<void> {      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {

    return this.http.put<void>(`${this.apiUrl}/${id}`, request).pipe(        this.router.navigate(['/projects']);

      tap(() => {      }

        this.error.set(null);    } else {

      }),      this.router.navigate(['/projects']);

      catchError(error => {    }

        this.error.set('Failed to update project');  }

        console.error('Error updating project:', error);

        throw error;  /// <summary>

      })  /// Check if field has error

    );  /// </summary>

  }  hasError(fieldName: string, errorType?: string): boolean {

    const field = this.form.get(fieldName);

  /// <summary>    if (!field) return false;

  /// Delete a project

  /// </summary>    if (errorType) {

  deleteProject(id: number): Observable<void> {      return field.hasError(errorType) && (field.dirty || field.touched);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(    }

      tap(() => {    return field.invalid && (field.dirty || field.touched);

        this.error.set(null);  }

      }),

      catchError(error => {  /// <summary>

        this.error.set('Failed to delete project');  /// Get error message for field

        console.error('Error deleting project:', error);  /// </summary>

        throw error;  getErrorMessage(fieldName: string): string {

      })    const field = this.form.get(fieldName);

    );    if (!field || !field.errors) return '';

  }

    const errors = field.errors;

  /// <summary>

  /// Load paginated projects with optional filters    if (errors['required']) {

  /// </summary>      return 'This field is required';

  loadProjectsPaged(filters?: Partial<PaginationParams>): Observable<ProjectPaginatedResponse> {    }

    this.loading.set(true);    if (errors['minlength']) {

    this.error.set(null);      return `Minimum length is ${errors['minlength'].requiredLength} characters`;

    }

    let params = new HttpParams()    if (errors['maxlength']) {

      .set('pageNumber', (filters?.pageNumber ?? 1).toString())      return `Maximum length is ${errors['maxlength'].requiredLength} characters`;

      .set('pageSize', (filters?.pageSize ?? 10).toString());    }

    if (errors['min']) {

    if (filters?.searchTerm) {      return `Minimum value is ${errors['min'].min}`;

      params = params.set('searchTerm', filters.searchTerm);    }

    }    if (errors['max']) {

    if (filters?.sortBy) {      return `Maximum value is ${errors['max'].max}`;

      params = params.set('sortBy', filters.sortBy);    }

    }

    if (filters?.sortDirection) {    return 'Invalid value';

      params = params.set('sortDirection', filters.sortDirection);  }

    }}

```

    return this.http.get<ProjectPaginatedResponse>(`${this.apiUrl}/paged`, { params }).pipe(

      tap(response => {Create file: `frontend/project-tracker/src/app/features/projects/components/project-form/project-form.component.html`

        this.projects.set(response.items);

        this.loading.set(false);```html

      }),<div class="container py-4">

      catchError(error => {  <div class="row justify-content-center">

        this.error.set('Failed to load projects');    <div class="col-lg-8">

        this.loading.set(false);      <!-- Header -->

        console.error('Error loading projects:', error);      <div class="d-flex justify-content-between align-items-center mb-4">

        return of({        <div>

          items: [],          <h2 class="mb-1">

          pageNumber: 1,            @if (isEditMode()) {

          pageSize: 10,              <i class="fas fa-edit me-2"></i>

          totalCount: 0,              {{ 'projects.editProject' | translate }}

          totalPages: 0,            } @else {

          hasPreviousPage: false,              <i class="fas fa-plus me-2"></i>

          hasNextPage: false              {{ 'projects.createProject' | translate }}

        });            }

      })          </h2>

    );          <p class="text-muted mb-0">

  }            {{ isEditMode() ? ('projects.editProjectDesc' | translate) : ('projects.createProjectDesc' | translate) }}

}          </p>

```        </div>

      </div>

**Key Features:**

- ✅ All CRUD methods return observables      <!-- Form Card -->

- ✅ Error handling with signal-based state      <div class="card shadow-sm">

- ✅ Type-safe models        <div class="card-body p-4">

- ✅ Automatic loading state management          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Title -->

### Project List Component - Delete Operation            <div class="mb-3">

              <label for="title" class="form-label">

**File: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.ts`**                {{ 'projects.projectName' | translate }}

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
