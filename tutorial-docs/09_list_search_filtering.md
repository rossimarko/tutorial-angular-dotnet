# Module 9: List View with Search & Filtering

## 🎯 Objectives

By the end of this module, you will:

- ✅ Understand the current project list implementation
- ✅ Display projects in a responsive Bootstrap table
- ✅ Handle loading and empty states
- ✅ Implement delete functionality
- ✅ Optimize performance with OnPush change detection
- ✅ Use services for data management

## 📌 Status: Framework Ready

The project list component displays user projects with proper state management using signals and demonstrates loading/empty states.

## 📋 What is a Data Table?

A **data table** displays structured data in rows and columns, allowing users to:
- **View**: See all their projects at a glance
- **Navigate**: Browse through records efficiently
- **Perform Actions**: Delete projects from the list

### Current Implementation Features:

- ✅ Responsive Bootstrap table
- ✅ Loading state with spinner
- ✅ Empty state messaging
- ✅ Error state display
- ✅ Delete functionality with state refresh
- ✅ Signal-based state management
- ✅ OnPush change detection for performance

---

## 🏗️ Architecture Overview

### Data Flow

```
ProjectListComponent
    ↓
ProjectService (Signals)
    ↓
HTTP GET /api/projects
    ↓
Backend API
    ↓
Database
```

### State Management

The `ProjectService` manages state using Angular signals:
- `projects`: Array of projects from the API
- `loading`: Boolean to show loading spinner
- `error`: Error message if something fails

---

## 📦 Data Models

File: `frontend/project-tracker/src/app/features/projects/services/project.service.ts`

```typescript
/// Project interface - matches backend response
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

/// Request model for creating projects
export interface CreateProjectRequest {
  title: string;
  description?: string;
  status: string;
  priority: number;
  startDate?: Date;
  dueDate?: Date;
}
```

---

## 🔧 Service Layer

File: `frontend/project-tracker/src/app/features/projects/services/project.service.ts`

The ProjectService handles all HTTP communication with the backend API:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/projects`;
  
  // State signals
  private readonly projects = signal<Project[]>([]);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);

  /// <summary>
  /// Load all projects for authenticated user
  /// </summary>
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

  /// <summary>
  /// Get projects as readonly signal
  /// </summary>
  getProjects() {
    return this.projects.asReadonly();
  }

  /// <summary>
  /// Get loading state
  /// </summary>
  getLoading() {
    return this.loading.asReadonly();
  }

  /// <summary>
  /// Get error state
  /// </summary>
  getError() {
    return this.error.asReadonly();
  }

  /// <summary>
  /// Create a new project
  /// </summary>
  createProject(request: CreateProjectRequest) {
    return this.http.post<Project>(this.apiUrl, request);
  }

  /// <summary>
  /// Get a single project by ID
  /// </summary>
  getProject(id: number) {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  /// <summary>
  /// Delete a project
  /// </summary>
  deleteProject(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### Key Features:

✅ **Signals for State**: Using `signal()` for reactive state management
✅ **Single Responsibility**: Only handles HTTP and state
✅ **Error Handling**: Catches errors and stores them in state
✅ **Observable Pattern**: Returns Observables from HTTP methods
✅ **Type Safe**: Properly typed with TypeScript interfaces

---

## 📊 Component Implementation

File: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.ts`

```typescript
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../../../core/services/auth.service';

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

  // Expose service signals to template
  protected readonly projects = this.projectService.getProjects();
  protected readonly loading = this.projectService.getLoading();
  protected readonly error = this.projectService.getError();

  ngOnInit() {    
    // Load projects when component initializes
    this.projectService.loadProjects();
  }

  /// <summary>
  /// Delete a project and refresh the list
  /// </summary>
  deleteProject(id: number) {
    this.projectService.deleteProject(id).subscribe({
      next: () => {
        // Reload projects after successful deletion
        this.projectService.loadProjects();
      },
      error: (err: unknown) => {
        console.error('Error deleting project:', err);
      }
    });
  }
}
```

### Key Points:

✅ **OnPush Change Detection**: Optimizes performance by only checking when signals change
✅ **Dependency Injection**: Uses `inject()` function instead of constructor
✅ **Protected Properties**: Exposes service signals to template (signals are readonly)
✅ **Lifecycle**: Loads projects on component init
✅ **Subscriptions**: Manually subscribes to HTTP calls (no memory leak because service unsubscribes)

---

## 🎨 Template

File: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.html`

```html
<div class="container-fluid py-4">
  <h2 class="mb-4">Projects</h2>

  @if (loading()) {
    <!-- Loading State -->
    <div class="alert alert-info" role="alert">
      <div class="spinner-border spinner-border-sm me-2" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      Loading projects...
    </div>
  } @else if (error()) {
    <!-- Error State -->
    <div class="alert alert-danger" role="alert">
      {{ error() }}
    </div>
  } @else {
    <!-- Projects Table or Empty State -->
    @if (projects().length > 0) {
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (project of projects(); track project.id) {
              <tr>
                <td class="fw-bold">{{ project.title }}</td>
                <td>{{ project.description }}</td>
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
      <!-- Empty State -->
      <div class="alert alert-secondary" role="alert">
        <i class="fas fa-info-circle me-2"></i>
        No projects found.
      </div>
    }
  }
</div>
```

### Template Features:

✅ **Conditional Rendering**: Using `@if` and `@else` for state management
✅ **Loop Rendering**: Using `@for` with track for efficient rendering
✅ **Loading Indicator**: Shows spinner while loading
✅ **Error Display**: Shows error messages if something fails
✅ **Empty State**: Shows friendly message when no projects exist
✅ **Delete Action**: Button to remove projects

### State Flow:

1. **Initial Load**: `loading()` is true → shows spinner
2. **Success**: `projects().length > 0` → shows table
3. **Empty**: `projects().length === 0` → shows "No projects found"
4. **Error**: `error()` has value → shows error message

---

## 🎯 Integration Points

### Backend API Endpoints

The component uses these backend endpoints:

```
GET    /api/projects              → Get all user projects
DELETE /api/projects/{id}         → Delete a project
```

### Authentication

The component automatically sends the JWT token with each request via the HTTP interceptor (configured in the auth module).

### Routing

The component is lazy-loaded in the routes:

```typescript
{
  path: 'projects',
  canActivate: [authGuard],
  loadComponent: () => import('./features/projects/components/project-list/project-list.component')
    .then(m => m.ProjectListComponent)
}
```

---

## ✅ Summary

### What We're Using:

1. ✅ **Signals**: For reactive state management (`projects`, `loading`, `error`)
2. ✅ **OnPush Change Detection**: For performance optimization
3. ✅ **Bootstrap 5**: For responsive table styling
4. ✅ **Standalone Components**: No NgModules required
5. ✅ **Native Control Flow**: Using `@if` and `@for` instead of `*ngIf` and `*ngFor`
6. ✅ **Dependency Injection**: Using `inject()` function

### Best Practices Applied:

- ✅ Single Responsibility Principle (component only handles UI, service handles data)
- ✅ Type Safety with TypeScript interfaces
- ✅ Proper error handling
- ✅ Loading state feedback to user
- ✅ Memory-efficient change detection
- ✅ Clean component interaction with signals

---

## 🚀 Next Steps

Future enhancements for this module:

1. **Search Functionality**: Filter projects by title/description
2. **Sorting**: Click column headers to sort
3. **Filtering**: Filter by status or priority
4. **Pagination**: Load projects in pages
5. **Edit/View**: Navigate to project detail/edit pages
6. **i18n Support**: Translate table headers and messages

**Next: [Module 10: Pagination & Export](./10_pagination_export.md)**
