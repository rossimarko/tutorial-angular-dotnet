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
    ↓ (search, filter, sort)
    ↓
ProjectService (Signals + Filtering Logic)
    ↓
HTTP GET /api/projects
    ↓
Backend API
    ↓
Database
```

### State Management

The `ProjectService` manages state using Angular signals:
- `projects`: Array of all projects from the API (unfiltered)
- `filteredProjects`: Computed signal with search/filter/sort applied
- `loading`: Boolean to show loading spinner
- `error`: Error message if something fails
- `searchTerm`: Current search term
- `selectedStatus`: Currently selected status filter
- `sortColumn`: Column currently being sorted
- `sortDirection`: Sort direction (asc/desc)

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

The ProjectService now handles search, filtering, and sorting with a computed signal that combines these operations:

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  
  // Filter/Sort signals
  private readonly searchTerm = signal('');
  private readonly selectedStatus = signal<string>('');
  private readonly sortColumn = signal<'title' | 'status' | 'priority' | 'dueDate'>('title');
  private readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // Computed signal: applies search, filter, and sort to projects
  private readonly filteredProjects = computed(() => {
    let result = [...this.projects()];

    // Apply search filter
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(term) ||
        (p.description?.toLowerCase().includes(term) ?? false)
      );
    }

    // Apply status filter
    if (this.selectedStatus()) {
      result = result.filter(p => p.status === this.selectedStatus());
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any = a[this.sortColumn()];
      let bValue: any = b[this.sortColumn()];

      // Handle null/undefined
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Compare
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;

      // Apply sort direction
      return this.sortDirection() === 'asc' ? comparison : -comparison;
    });

    return result;
  });

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
  /// Get filtered projects as readonly signal
  /// </summary>
  getFilteredProjects() {
    return this.filteredProjects.asReadonly();
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
  /// Update search term
  /// </summary>
  setSearchTerm(term: string) {
    this.searchTerm.set(term);
  }

  /// <summary>
  /// Update status filter
  /// </summary>
  setStatusFilter(status: string) {
    this.selectedStatus.set(status);
  }

  /// <summary>
  /// Update sort column and direction
  /// </summary>
  setSorting(column: 'title' | 'status' | 'priority' | 'dueDate') {
    // If clicking the same column, toggle direction
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, sort ascending
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
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

### Key Enhancements:

✅ **Computed Signal**: `filteredProjects` automatically updates when search, filter, or sort changes
✅ **Search Logic**: Filters by title and description (case-insensitive)
✅ **Status Filter**: Narrows results by project status
✅ **Sorting**: Handles multiple columns with toggle-able direction
✅ **Pure Function**: Filtering/sorting logic doesn't mutate original data
✅ **Type Safe**: All filter/sort operations are strongly typed

---

## 📊 Component Implementation - Enhanced

File: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.ts`

The component now handles search, filter, and sort interactions:

```typescript
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../../../core/services/auth.service';

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
  protected readonly projects = this.projectService.getFilteredProjects();
  protected readonly loading = this.projectService.getLoading();
  protected readonly error = this.projectService.getError();

  // Form controls for search and filter
  protected readonly searchControl = new FormControl('');
  protected readonly statusFilter = new FormControl('');

  // Available statuses for filter dropdown
  protected readonly statuses = ['Active', 'Pending', 'Completed', 'Cancelled'];

  // Current sort state
  protected currentSortColumn = '';
  protected currentSortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit() {
    // Load projects when component initializes
    this.projectService.loadProjects();

    // Subscribe to search changes
    this.searchControl.valueChanges.subscribe(term => {
      this.projectService.setSearchTerm(term || '');
    });

    // Subscribe to status filter changes
    this.statusFilter.valueChanges.subscribe(status => {
      this.projectService.setStatusFilter(status || '');
    });
  }

  /// <summary>
  /// Handle column header clicks for sorting
  /// </summary>
  sortByColumn(column: 'title' | 'status' | 'priority' | 'dueDate') {
    this.projectService.setSorting(column);
    this.currentSortColumn = column;
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
        this.projectService.loadProjects();
      },
      error: (err: unknown) => {
        console.error('Error deleting project:', err);
      }
    });
  }
}
```

### Key Enhancements:

✅ **FormControl**: For search and status filter inputs
✅ **ValueChanges Subscription**: Reacts to user input in real-time
✅ **Sorting Methods**: Handle column header clicks
✅ **Sort Indicator**: Shows visual feedback for current sort state
✅ **Separation of Concerns**: Component handles UI interactions, service handles filtering logic

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
                class="cursor-pointer"
                role="button"
                tabindex="0">
                Name {{ getSortIndicator('title') }}
              </th>
              <th 
                (click)="sortByColumn('status')"
                class="cursor-pointer"
                role="button"
                tabindex="0">
                Status {{ getSortIndicator('status') }}
              </th>
              <th 
                (click)="sortByColumn('priority')"
                class="cursor-pointer"
                role="button"
                tabindex="0">
                Priority {{ getSortIndicator('priority') }}
              </th>
              <th 
                (click)="sortByColumn('dueDate')"
                class="cursor-pointer"
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

### Component CSS

File: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.css`

```css
.cursor-pointer {
  cursor: pointer;
  user-select: none;
}

.cursor-pointer:hover {
  background-color: #f8f9fa;
  text-decoration: underline;
}

.table-hover tbody tr:hover {
  background-color: #f5f5f5;
}
```

### User Experience Flow:

1. **Initial Load**: Component loads all projects and displays them
2. **Search**: User types in search box → projects instantly filter
3. **Filter**: User selects status → filtered projects update
4. **Sort**: User clicks column header → projects sort (toggle asc/desc)
5. **Combined**: All three work together (search + filter + sort)

---

## 🎯 Implementation Checklist

Complete these steps to implement search, filtering, and sorting:

### Step 1: Update the Service

1. Add import for `computed()` from `@angular/core`
2. Add filter/sort signals: `searchTerm`, `selectedStatus`, `sortColumn`, `sortDirection`
3. Create `filteredProjects` computed signal with filtering and sorting logic
4. Add methods: `setSearchTerm()`, `setStatusFilter()`, `setSorting()`
5. Update `getFilteredProjects()` to return the computed signal instead of raw projects

### Step 2: Update the Component

1. Import `ReactiveFormsModule` and `FormControl`
2. Create `searchControl` and `statusFilter` FormControl instances
3. Create `statuses` array with available status values
4. In `ngOnInit()`, subscribe to `valueChanges` on both form controls
5. Add `sortByColumn()` method to handle column clicks
6. Add `getSortIndicator()` method to display sort direction
7. Update template binding from `projects` to `projects()` signal

### Step 3: Update the Template

1. Add search input with `[formControl]="searchControl"`
2. Add status filter select with `[formControl]="statusFilter"`
3. Make column headers clickable with `(click)="sortByColumn()"`
4. Add sort indicators (↑↓) to headers
5. Display status as colored badges using Bootstrap badge classes
6. Update empty state message

### Step 4: Add Styles

1. Create `.cursor-pointer` class for clickable headers
2. Add hover effects for better UX

### Step 5: Test

1. Type in search box → verify projects filter
2. Select status → verify filter works
3. Click column header → verify sorting works
4. Combine search + filter + sort → verify they work together
5. Delete a project → verify list updates

---

## 🔗 Integration Points

### Backend API Endpoints

The component still uses these endpoints (no changes needed):

```
GET    /api/projects              → Get all user projects
DELETE /api/projects/{id}         → Delete a project
```

All filtering happens on the client-side using signals (no server calls needed for filter/search/sort).

### Authentication

The component automatically sends the JWT token with each request via the HTTP interceptor.

### Routing

The component remains lazy-loaded in the routes (no changes needed).

---

## 💡 Best Practices Applied

### Signals & Computed Values
- ✅ Use `signal()` for mutable state (search, filter, sort)
- ✅ Use `computed()` to derive filtered results automatically
- ✅ No manual change detection needed (OnPush handles it)

### Reactive Forms
- ✅ Use `FormControl` for user inputs
- ✅ Subscribe to `valueChanges` to react to user input
- ✅ Bind controls with `[formControl]` directive

### Performance
- ✅ OnPush change detection detects only when signals change
- ✅ Computed signal only recalculates when dependencies change
- ✅ Native control flow (`@if`, `@for`) is more efficient

### User Experience
- ✅ Real-time search/filter as user types
- ✅ Visual feedback for sort direction
- ✅ Color-coded status indicators
- ✅ Clear empty state messaging
- ✅ Responsive design works on mobile

### Code Organization
- ✅ Business logic in service (filtering, sorting)
- ✅ UI interaction in component (form controls, events)
- ✅ Template focused on display only
- ✅ Styles separated in CSS file
