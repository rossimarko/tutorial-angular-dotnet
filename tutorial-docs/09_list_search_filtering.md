# Module 9: List View with Search & Filtering

## 🎯 Objectives

By the end of this module, you will:

- ✅ Understand the current project list implementation
- ✅ Display projects in a responsive Bootstrap table
- ✅ Handle loading and empty states
- ✅ Implement delete functionality
- ✅ **Implement search functionality** to filter projects by title/description
- ✅ **Implement sorting** by clicking column headers
- ✅ **Implement status filtering** to filter by project status
- ✅ Optimize performance with OnPush change detection
- ✅ Use services for data management

## 📌 Status: Ready to Implement

Building on Module 8's foundation, you will now add search, filtering, and sorting capabilities to make the project list interactive and user-friendly.

## 📋 What is Search, Filtering & Sorting?

A **data table** should be interactive and help users find what they need:
- **View**: See all their projects at a glance
- **Search**: Find projects by typing title or description
- **Filter**: Narrow down projects by status or other criteria
- **Sort**: Click column headers to organize by different fields
- **Navigate**: Browse through records efficiently
- **Perform Actions**: Delete, edit, or view projects

### Module Features:

- ✅ Responsive Bootstrap table
- ✅ Loading state with spinner
- ✅ Empty state messaging
- ✅ Error state display
- ✅ Delete functionality with state refresh
- ✅ **Search input** to filter by title/description
- ✅ **Status filter dropdown** to filter by project status
- ✅ **Sortable column headers** - click to sort ascending/descending
- ✅ Signal-based state management
- ✅ OnPush change detection for performance
- ✅ Reactive Forms for search/filter inputs

---

## 🏗️ Architecture Overview

### Data Flow

```
ProjectListComponent
    ↓ (user enters search/filter/sort)
    ↓
ProjectService
    ↓
HTTP GET /api/projects?search=...&status=...&sortBy=...&sortOrder=asc
    ↓
Backend API (filters/sorts data)
    ↓
Database
    ↓
Filtered & Sorted Results
```

### State Management

The `ProjectService` manages state using Angular signals:
- `projects`: Array of projects returned from the API
- `loading`: Boolean to show loading spinner
- `error`: Error message if something fails
- `currentSearch`: Current search term (local, for UI only)
- `currentStatus`: Currently selected status filter (local, for UI only)
- `currentSort`: Current sort column and direction (local, for UI only)

**Note**: Search, filter, and sort parameters are sent to the backend API via query parameters. The backend handles all filtering and sorting logic before returning results.

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

## 🔧 Service Layer - Enhanced

File: `frontend/project-tracker/src/app/features/projects/services/project.service.ts`

The ProjectService now sends search, filter, and sort parameters to the backend API:

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  /// Load projects with optional search, filter, and sort parameters
  /// All filtering is done server-side for pagination support
  /// </summary>
  loadProjects(options?: {
    search?: string;
    status?: string;
    sortBy?: 'title' | 'status' | 'priority' | 'dueDate';
    sortOrder?: 'asc' | 'desc';
  }) {
    this.loading.set(true);
    this.error.set(null);

    // Build query parameters
    let params = new HttpParams();
    if (options?.search) {
      params = params.set('search', options.search);
    }
    if (options?.status) {
      params = params.set('status', options.status);
    }
    if (options?.sortBy) {
      params = params.set('sortBy', options.sortBy);
    }
    if (options?.sortOrder) {
      params = params.set('sortOrder', options.sortOrder);
    }

    this.http.get<Project[]>(this.apiUrl, { params }).subscribe({
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

✅ **Query Parameters**: Uses `HttpParams` to build query strings
✅ **Optional Parameters**: All filter/sort options are optional
✅ **Server-Side Filtering**: Backend handles all filtering logic
✅ **Ready for Pagination**: Can easily add `pageNumber` and `pageSize` parameters later
✅ **Type Safe**: Strong typing for all parameters
✅ **Flexible**: Supports any combination of filters

---

## 📊 Component Implementation - Enhanced

File: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.ts`

The component now sends search, filter, and sort requests to the backend API:

```typescript
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../../../core/services/auth.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);

  // Expose service signals to template
  protected readonly projects = this.projectService.getProjects();
  protected readonly loading = this.projectService.getLoading();
  protected readonly error = this.projectService.getError();

  // Form controls for search and filter
  protected readonly searchControl = new FormControl('');
  protected readonly statusFilter = new FormControl('');

  // Available statuses for filter dropdown
  protected readonly statuses = ['Active', 'Pending', 'Completed', 'Cancelled'];

  // Current sort state (for UI display only)
  protected currentSortColumn: 'title' | 'status' | 'priority' | 'dueDate' = 'title';
  protected currentSortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit() {
    // Initial load
    this.loadProjects();

    // Subscribe to search changes with debounce to avoid too many API calls
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.loadProjects();
      });

    // Subscribe to status filter changes (immediate, no debounce)
    this.statusFilter.valueChanges.subscribe(() => {
      this.loadProjects();
    });
  }

  /// <summary>
  /// Load projects from API with current search/filter/sort parameters
  /// </summary>
  private loadProjects() {
    const search = this.searchControl.value || undefined;
    const status = this.statusFilter.value || undefined;

    this.projectService.loadProjects({
      search,
      status,
      sortBy: this.currentSortColumn,
      sortOrder: this.currentSortDirection
    });
  }

  /// <summary>
  /// Handle column header clicks for sorting
  /// </summary>
  sortByColumn(column: 'title' | 'status' | 'priority' | 'dueDate') {
    // If clicking the same column, toggle direction
    if (this.currentSortColumn === column) {
      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, sort ascending
      this.currentSortColumn = column;
      this.currentSortDirection = 'asc';
    }
    
    // Reload projects with new sort
    this.loadProjects();
  }

  /// <summary>
  /// Get sort indicator for column header
  /// </summary>
  getSortIndicator(column: string): string {
    if (this.currentSortColumn !== column) return '';
    return this.currentSortDirection === 'asc' ? '↑' : '↓';
  }

  /// <summary>
  /// Delete a project and refresh the list
  /// </summary>
  deleteProject(id: number) {
    this.projectService.deleteProject(id).subscribe({
      next: () => {
        this.loadProjects();
      },
      error: (err: unknown) => {
        console.error('Error deleting project:', err);
      }
    });
  }
}
```

### Key Features:

✅ **Debounce Search**: Waits 300ms after user stops typing to avoid excessive API calls
✅ **Distinct Until Changed**: Only triggers search if the value actually changed
✅ **Immediate Filter**: Status filter triggers API call immediately
✅ **Sort Toggle**: Click same column to toggle between asc/desc
✅ **Local Sort State**: Component tracks sort state for UI display
✅ **API Parameters**: Passes all options to service which sends them as query parameters
✅ **Flexible Loading**: `loadProjects()` can be called with any combination of parameters

---

## 🎨 Template - Enhanced

File: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.html`

```html
<div class="container-fluid py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Projects</h2>
  </div>

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
    <!-- Search & Filter Section -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <!-- Search Input -->
          <div class="col-md-6">
            <label for="search" class="form-label">Search Projects</label>
            <input 
              id="search"
              type="text" 
              class="form-control" 
              placeholder="Search by title or description..."
              [formControl]="searchControl">
          </div>

          <!-- Status Filter -->
          <div class="col-md-6">
            <label for="status" class="form-label">Filter by Status</label>
            <select 
              id="status"
              class="form-select" 
              [formControl]="statusFilter">
              <option value="">All Statuses</option>
              @for (status of statuses; track status) {
                <option [value]="status">{{ status }}</option>
              }
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Projects Table or Empty State -->
    @if (projects().length > 0) {
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th 
                (click)="sortByColumn('title')"
                style="cursor: pointer;"
                role="button"
                tabindex="0">
                Name {{ getSortIndicator('title') }}
              </th>
              <th 
                (click)="sortByColumn('status')"
                style="cursor: pointer;"
                role="button"
                tabindex="0">
                Status {{ getSortIndicator('status') }}
              </th>
              <th 
                (click)="sortByColumn('priority')"
                style="cursor: pointer;"
                role="button"
                tabindex="0">
                Priority {{ getSortIndicator('priority') }}
              </th>
              <th 
                (click)="sortByColumn('dueDate')"
                style="cursor: pointer;"
                role="button"
                tabindex="0">
                Due Date {{ getSortIndicator('dueDate') }}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (project of projects(); track project.id) {
              <tr>
                <td class="fw-bold">{{ project.title }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-success': project.status === 'Active',
                    'bg-warning': project.status === 'Pending',
                    'bg-secondary': project.status === 'Completed',
                    'bg-danger': project.status === 'Cancelled'
                  }">
                    {{ project.status }}
                  </span>
                </td>
                <td>{{ project.priority }}</td>
                <td>{{ project.dueDate | date: 'short' }}</td>
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
        No projects found. Try adjusting your search or filter criteria.
      </div>
    }
  }
</div>
```

### Template Enhancements:

✅ **Search Input**: Text field for filtering by title/description
✅ **Status Filter**: Dropdown for filtering by status
✅ **Sortable Headers**: Click column headers to sort (with visual indicators ↑↓)
✅ **Status Badges**: Color-coded status indicators
✅ **Responsive Layout**: Search/filter in card above table
✅ **FormControl Integration**: Two-way binding with component controls
✅ **Accessibility**: Added `role`, `tabindex`, and proper labels
✅ **Bootstrap Styling**: Pure Bootstrap 5 utility classes, no custom CSS

### User Experience Flow:

1. **Initial Load**: Component loads all projects and displays them
2. **Search**: User types in search box → projects instantly filter
3. **Filter**: User selects status → filtered projects update
4. **Sort**: User clicks column header → projects sort (toggle asc/desc)
5. **Combined**: All three work together (search + filter + sort)

---

## 🎯 Implementation Checklist

Complete these steps to implement server-side search, filtering, and sorting:

### Step 1: Backend API Updates (C#/.NET 9)

The backend API endpoint must support query parameters:

```
GET /api/projects?search=keyword&status=Active&sortBy=title&sortOrder=asc
```

Expected implementation:
- `search` parameter: Filter by title or description (case-insensitive substring match)
- `status` parameter: Filter by project status (exact match)
- `sortBy` parameter: Column to sort by (title, status, priority, dueDate)
- `sortOrder` parameter: Sort direction (asc or desc)

Example C# controller signature:
```csharp
[HttpGet]
public async Task<ActionResult<IEnumerable<ProjectDto>>> GetProjects(
    [FromQuery] string? search,
    [FromQuery] string? status,
    [FromQuery] string? sortBy = "title",
    [FromQuery] string? sortOrder = "asc")
{
    // Filter and sort logic in service/repository
    var projects = await _projectService.GetProjectsAsync(
        userId: userId,
        search: search,
        status: status,
        sortBy: sortBy,
        sortOrder: sortOrder);
    return Ok(projects);
}
```

### Step 2: Update the Frontend Service

1. Import `HttpParams` from `@angular/common/http`
2. Modify `loadProjects()` to accept options parameter
3. Build `HttpParams` from options
4. Pass params to `http.get()` call
5. Remove any client-side filtering logic

### Step 3: Update the Component

1. Import `ReactiveFormsModule`, `FormControl`, and RxJS operators (`debounceTime`, `distinctUntilChanged`)
2. Create `searchControl` and `statusFilter` FormControl instances
3. Add `currentSortColumn` and `currentSortDirection` properties (for UI state only)
4. In `ngOnInit()`:
   - Call `loadProjects()` for initial load
   - Subscribe to `searchControl.valueChanges` with `debounceTime(300)` and `distinctUntilChanged()`
   - Subscribe to `statusFilter.valueChanges` without debounce (immediate response)
5. Add `loadProjects()` private method that collects current search/filter/sort and calls service
6. Add `sortByColumn()` method to toggle sort direction
7. Add `getSortIndicator()` method for UI

### Step 4: Update the Template

1. Add search input with `[formControl]="searchControl"`
2. Add status filter select with `[formControl]="statusFilter"`
3. Make column headers clickable with `(click)="sortByColumn()"`
4. Add sort indicators (↑↓) to headers
5. Display results from API (already filtered/sorted)

### Step 5: Test

1. Type in search box → verify API is called with search parameter
2. Select status → verify API is called with status parameter
3. Click column header → verify API is called with sortBy and sortOrder parameters
4. Combine search + filter + sort → verify all parameters sent together
5. Delete a project → verify list refreshes with current filters intact
6. Verify query strings in browser DevTools Network tab

---

## 🔗 Integration Points

### Backend API Implementation

The backend API endpoint supports search, filter, and sort via query parameters:

```
GET /api/projects                              → Get all user projects (no filters)
GET /api/projects?search=test                  → Search projects by title/description
GET /api/projects?status=Active                → Filter by status
GET /api/projects?sortBy=priority&sortOrder=desc → Sort by priority descending
GET /api/projects?search=test&status=Active&sortBy=title&sortOrder=asc → Combined
DELETE /api/projects/{id}                      → Delete a project
```

**C# Controller Implementation** (Backend):

File: `backend/ProjectTracker.API/Controllers/ProjectsController.cs`

```csharp
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
```

**Query Parameter Details:**

- `search` (optional): Filter by title or description (case-insensitive substring match)
- `status` (optional): Filter by project status (exact match, case-insensitive)
- `sortBy` (optional, default: "title"): Column to sort by
  - Valid values: `title`, `status`, `priority`, `dueDate`
- `sortOrder` (optional, default: "asc"): Sort direction
  - Valid values: `asc` (ascending), `desc` (descending)

**All parameters are optional** - the endpoint works with any combination:
- No parameters → returns all projects sorted by title ascending
- With search → returns filtered by title/description
- With status → returns filtered by status
- With sortBy and sortOrder → returns sorted accordingly
- All combined → returns results with all filters applied

### Authentication

The component automatically sends the JWT token with each request via the HTTP interceptor.

### Routing

The component remains lazy-loaded in the routes (no changes needed).

---

## 💡 Best Practices Applied

### Server-Side Operations
- ✅ **Search/Filter/Sort on Backend**: Database can be optimized for these operations
- ✅ **Query Parameters**: Standard REST convention for passing filter criteria
- ✅ **Ready for Pagination**: Can easily add `pageNumber`, `pageSize` later
- ✅ **Scalability**: Works efficiently with large datasets

### Frontend Optimization
- ✅ **Debounce Search**: Prevents excessive API calls while user is typing
- ✅ **DistinctUntilChanged**: Only calls API if value actually changed
- ✅ **Local Sort State**: Component tracks sort UI state separately
- ✅ **OnPush Change Detection**: Optimizes change detection when signals update

### Reactive Forms
- ✅ **FormControl for Inputs**: Better state management than ngModel
- ✅ **ValueChanges Observable**: Clean way to react to user input
- ✅ **Debounce & Distinct Operators**: Standard RxJS patterns

### Code Organization
- ✅ **Business Logic in Service**: HTTP calls and parameter building
- ✅ **UI Logic in Component**: Form controls and event handling
- ✅ **Template Focused on Display**: Shows data returned from API
- ✅ **Separation of Concerns**: Each layer has a single responsibility

### User Experience
- ✅ **Real-time Search**: Debounced to avoid lag
- ✅ **Visual Feedback**: Sort indicators (↑↓) on headers
- ✅ **Color-coded Status**: Easy to scan project statuses
- ✅ **Clear Empty State**: Users know why no results appear
- ✅ **Responsive Design**: Works on all screen sizes

### Future-Ready
- ✅ **Easy to Add Pagination**: Just add `pageNumber` and `pageSize` parameters
- ✅ **Easy to Add More Filters**: Add new query parameters as needed
- ✅ **Backend-Driven**: Backend can optimize queries independently
- ✅ **Scalable**: Works with databases of any size
