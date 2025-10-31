# Module 9: List View with Search & Filtering# Module 9: List View with Search & Filtering



## 🎯 Objectives## 🎯 Objectives



By the end of this module, you will:- ✅ Data table component

- ✅ Build a responsive data table component- ✅ Search functionality

- ✅ Implement search functionality with debounce- ✅ Filter implementation

- ✅ Add multi-column filtering- ✅ Sorting

- ✅ Create sortable table columns- ✅ Responsive design

- ✅ Handle loading and empty states

- ✅ Optimize performance with OnPush detection## 📌 Status: Framework Ready

- ✅ Integrate with backend API endpoints

Implement:

## 📋 What is a Data Table?- [ ] Projects list component

- [ ] Search input with debounce

A **data table** displays structured data in rows and columns, allowing users to:- [ ] Filter controls

- **Search**: Find specific records quickly- [ ] Sort columns

- **Filter**: Show only relevant data- [ ] Bootstrap responsive table

- **Sort**: Order data by different columns

- **Navigate**: Browse through records efficiently---



### Our Implementation Features:**Next: [Module 10: Pagination & Export](./10_pagination_export.md)**

- Real-time search with debounce (300ms delay)
- Status and priority filters
- Multi-column sorting
- Responsive Bootstrap design
- Loading/empty states with proper UX

---

## 🗃️ Step 1: Project Model & Service Enhancement

First, let's enhance our project service to support search and filtering.

Update file: `frontend/project-tracker/src/app/shared/models/project.model.ts`

```typescript
/// <summary>
/// Project model
/// </summary>
export interface Project {
  id: number;
  userId: number;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: number;
  startDate: Date | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/// <summary>
/// Project status enum
/// </summary>
export type ProjectStatus = 'Active' | 'Completed' | 'OnHold' | 'Cancelled';

/// <summary>
/// Project filter criteria
/// </summary>
export interface ProjectFilters {
  searchTerm?: string;
  status?: ProjectStatus | '';
  priority?: number | '';
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/// <summary>
/// API response for project list
/// </summary>
export interface ProjectListResponse {
  items: Project[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
```

Update file: `frontend/project-tracker/src/app/features/projects/services/project.service.ts`

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Project, ProjectFilters, ProjectListResponse } from '../../../shared/models/project.model';

/// <summary>
/// Service for managing projects with search and filtering
/// </summary>
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
  private readonly totalCount = signal(0);

  /// <summary>
  /// Get all projects with optional filters
  /// </summary>
  getProjects(filters?: ProjectFilters): Observable<Project[]> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();

    if (filters) {
      if (filters.searchTerm) {
        params = params.set('searchTerm', filters.searchTerm);
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.priority) {
        params = params.set('priority', filters.priority.toString());
      }
      if (filters.sortBy) {
        params = params.set('sortBy', filters.sortBy);
      }
      if (filters.sortDirection) {
        params = params.set('sortDirection', filters.sortDirection);
      }
    }

    return this.http.get<Project[]>(this.apiUrl, { params }).pipe(
      tap(projects => {
        this.projects.set(projects);
        this.totalCount.set(projects.length);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to load projects');
        this.loading.set(false);
        console.error('Error loading projects:', error);
        return of([]);
      })
    );
  }

  /// <summary>
  /// Get project by ID
  /// </summary>
  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  /// <summary>
  /// Create new project
  /// </summary>
  createProject(project: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  /// <summary>
  /// Update existing project
  /// </summary>
  updateProject(id: number, project: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  /// <summary>
  /// Delete project
  /// </summary>
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Getters for signals
  getProjectsSignal() {
    return this.projects.asReadonly();
  }

  getLoadingSignal() {
    return this.loading.asReadonly();
  }

  getErrorSignal() {
    return this.error.asReadonly();
  }

  getTotalCountSignal() {
    return this.totalCount.asReadonly();
  }
}
```

---

## 🔍 Step 2: Search & Filter Component

Create file: `frontend/project-tracker/src/app/features/projects/components/project-filters/project-filters.component.ts`

```typescript
import { Component, output, signal, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { ProjectStatus, ProjectFilters } from '../../../../shared/models/project.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

/// <summary>
/// Component for project search and filtering
/// Emits filter changes with debounce for search input
/// </summary>
@Component({
  selector: 'app-project-filters',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './project-filters.component.html',
  styleUrl: './project-filters.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectFiltersComponent {
  // Output event when filters change
  readonly filtersChanged = output<ProjectFilters>();

  // Filter values
  protected readonly searchTerm = signal('');
  protected readonly selectedStatus = signal<ProjectStatus | ''>('');
  protected readonly selectedPriority = signal<number | ''>('');

  // Available filter options
  protected readonly statusOptions: (ProjectStatus | '')[] = ['', 'Active', 'Completed', 'OnHold', 'Cancelled'];
  protected readonly priorityOptions: (number | '')[] = ['', 1, 2, 3, 4, 5];

  // Search debounce subject
  private readonly searchSubject = new Subject<string>();

  constructor() {
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(searchTerm => {
      this.searchTerm.set(searchTerm);
      this.emitFilters();
    });

    // React to filter changes
    effect(() => {
      // This effect runs when status or priority changes
      this.selectedStatus();
      this.selectedPriority();
      this.emitFilters();
    });
  }

  /// <summary>
  /// Handle search input changes
  /// </summary>
  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  /// <summary>
  /// Clear all filters
  /// </summary>
  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('');
    this.selectedPriority.set('');
    this.emitFilters();
  }

  /// <summary>
  /// Emit current filter values
  /// </summary>
  private emitFilters(): void {
    const filters: ProjectFilters = {
      searchTerm: this.searchTerm() || undefined,
      status: this.selectedStatus() || undefined,
      priority: this.selectedPriority() || undefined
    };

    this.filtersChanged.emit(filters);
  }

  /// <summary>
  /// Check if any filters are active
  /// </summary>
  hasActiveFilters(): boolean {
    return !!(this.searchTerm() || this.selectedStatus() || this.selectedPriority());
  }
}
```

Create file: `frontend/project-tracker/src/app/features/projects/components/project-filters/project-filters.component.html`

```html
<div class="card mb-3">
  <div class="card-body">
    <div class="row g-3">
      <!-- Search Input -->
      <div class="col-12 col-md-4">
        <label for="search" class="form-label">
          <i class="fas fa-search me-2"></i>
          {{ 'common.search' | translate }}
        </label>
        <input
          type="text"
          id="search"
          class="form-control"
          [value]="searchTerm()"
          (input)="onSearchChange($any($event.target).value)"
          [placeholder]="'projects.searchPlaceholder' | translate">
      </div>

      <!-- Status Filter -->
      <div class="col-12 col-md-3">
        <label for="status" class="form-label">
          <i class="fas fa-flag me-2"></i>
          {{ 'projects.status' | translate }}
        </label>
        <select
          id="status"
          class="form-select"
          [value]="selectedStatus()"
          (change)="selectedStatus.set($any($event.target).value)">
          @for (status of statusOptions; track status) {
            <option [value]="status">
              @if (status === '') {
                {{ 'common.all' | translate }}
              } @else {
                {{ 'projects.status_' + status | translate }}
              }
            </option>
          }
        </select>
      </div>

      <!-- Priority Filter -->
      <div class="col-12 col-md-3">
        <label for="priority" class="form-label">
          <i class="fas fa-exclamation-circle me-2"></i>
          {{ 'projects.priority' | translate }}
        </label>
        <select
          id="priority"
          class="form-select"
          [value]="selectedPriority()"
          (change)="selectedPriority.set($any($event.target).value)">
          @for (priority of priorityOptions; track priority) {
            <option [value]="priority">
              @if (priority === '') {
                {{ 'common.all' | translate }}
              } @else {
                {{ 'projects.priority_' + priority | translate }}
              }
            </option>
          }
        </select>
      </div>

      <!-- Clear Filters Button -->
      <div class="col-12 col-md-2 d-flex align-items-end">
        <button
          type="button"
          class="btn btn-outline-secondary w-100"
          (click)="clearFilters()"
          [disabled]="!hasActiveFilters()">
          <i class="fas fa-times me-2"></i>
          {{ 'common.clear' | translate }}
        </button>
      </div>
    </div>

    <!-- Active Filters Badge -->
    @if (hasActiveFilters()) {
      <div class="mt-3">
        <span class="badge bg-primary">
          <i class="fas fa-filter me-1"></i>
          {{ 'common.filtersActive' | translate }}
        </span>
      </div>
    }
  </div>
</div>
```

Create file: `frontend/project-tracker/src/app/features/projects/components/project-filters/project-filters.component.css`

```css
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

.badge {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}
```

---

## 📊 Step 3: Data Table Component

Create file: `frontend/project-tracker/src/app/features/projects/components/project-table/project-table.component.ts`

```typescript
import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project, ProjectStatus } from '../../../../shared/models/project.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { LocaleDatePipe } from '../../../../shared/pipes/locale-date.pipe';

/// <summary>
/// Sortable data table component for projects
/// </summary>
@Component({
  selector: 'app-project-table',
  imports: [CommonModule, TranslatePipe, LocaleDatePipe],
  templateUrl: './project-table.component.html',
  styleUrl: './project-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectTableComponent {
  // Inputs
  readonly projects = input.required<Project[]>();
  readonly loading = input<boolean>(false);

  // Outputs
  readonly editProject = output<Project>();
  readonly deleteProject = output<Project>();
  readonly viewProject = output<Project>();

  // Sorting state
  private readonly sortColumn = signal<string>('createdAt');
  private readonly sortDirection = signal<'asc' | 'desc'>('desc');

  // Sorted projects computed from input and sort state
  protected readonly sortedProjects = computed(() => {
    const projects = [...this.projects()];
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return projects.sort((a, b) => {
      let aVal: any = a[column as keyof Project];
      let bVal: any = b[column as keyof Project];

      // Handle dates
      if (aVal instanceof Date) aVal = aVal.getTime();
      if (bVal instanceof Date) bVal = bVal.getTime();

      // Handle null/undefined
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      // Compare
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  });

  /// <summary>
  /// Toggle sort for a column
  /// </summary>
  toggleSort(column: string): void {
    if (this.sortColumn() === column) {
      // Toggle direction
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  /// <summary>
  /// Get sort icon for column
  /// </summary>
  getSortIcon(column: string): string {
    if (this.sortColumn() !== column) {
      return 'fas fa-sort';
    }
    return this.sortDirection() === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  /// <summary>
  /// Get status badge class
  /// </summary>
  getStatusBadgeClass(status: ProjectStatus): string {
    const classes: Record<ProjectStatus, string> = {
      'Active': 'bg-success',
      'Completed': 'bg-primary',
      'OnHold': 'bg-warning',
      'Cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  /// <summary>
  /// Get priority display
  /// </summary>
  getPriorityStars(priority: number): string {
    return '⭐'.repeat(Math.min(priority, 5));
  }

  /// <summary>
  /// Check if date is overdue
  /// </summary>
  isOverdue(dueDate: Date | null): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }
}
```

Create file: `frontend/project-tracker/src/app/features/projects/components/project-table/project-table.component.html`

```html
<div class="table-responsive">
  @if (loading()) {
    <!-- Loading State -->
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">{{ 'common.loading' | translate }}</span>
      </div>
      <p class="mt-3 text-muted">{{ 'common.loading' | translate }}</p>
    </div>
  } @else if (projects().length === 0) {
    <!-- Empty State -->
    <div class="text-center py-5">
      <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">{{ 'projects.noProjects' | translate }}</h5>
      <p class="text-muted">{{ 'projects.noProjectsHint' | translate }}</p>
    </div>
  } @else {
    <!-- Data Table -->
    <table class="table table-hover table-striped align-middle">
      <thead class="table-light">
        <tr>
          <th scope="col" class="sortable" (click)="toggleSort('title')">
            {{ 'projects.projectName' | translate }}
            <i [class]="getSortIcon('title')"></i>
          </th>
          <th scope="col" class="d-none d-md-table-cell">
            {{ 'projects.description' | translate }}
          </th>
          <th scope="col" class="sortable" (click)="toggleSort('status')">
            {{ 'projects.status' | translate }}
            <i [class]="getSortIcon('status')"></i>
          </th>
          <th scope="col" class="sortable d-none d-lg-table-cell" (click)="toggleSort('priority')">
            {{ 'projects.priority' | translate }}
            <i [class]="getSortIcon('priority')"></i>
          </th>
          <th scope="col" class="sortable d-none d-xl-table-cell" (click)="toggleSort('dueDate')">
            {{ 'projects.dueDate' | translate }}
            <i [class]="getSortIcon('dueDate')"></i>
          </th>
          <th scope="col" class="text-center">
            {{ 'common.actions' | translate }}
          </th>
        </tr>
      </thead>
      <tbody>
        @for (project of sortedProjects(); track project.id) {
          <tr>
            <!-- Title -->
            <td class="fw-bold">
              <button 
                class="btn btn-link p-0 text-start"
                (click)="viewProject.emit(project)">
                {{ project.title }}
              </button>
            </td>

            <!-- Description (hidden on mobile) -->
            <td class="d-none d-md-table-cell text-truncate" style="max-width: 300px;">
              {{ project.description || '-' }}
            </td>

            <!-- Status Badge -->
            <td>
              <span [class]="'badge ' + getStatusBadgeClass(project.status)">
                {{ 'projects.status_' + project.status | translate }}
              </span>
            </td>

            <!-- Priority (hidden on tablet) -->
            <td class="d-none d-lg-table-cell">
              <span [title]="'Priority: ' + project.priority">
                {{ getPriorityStars(project.priority) }}
              </span>
            </td>

            <!-- Due Date (hidden on smaller screens) -->
            <td class="d-none d-xl-table-cell">
              @if (project.dueDate) {
                <span [class.text-danger]="isOverdue(project.dueDate)">
                  {{ project.dueDate | localeDate }}
                </span>
              } @else {
                <span class="text-muted">-</span>
              }
            </td>

            <!-- Actions -->
            <td class="text-center">
              <div class="btn-group btn-group-sm" role="group">
                <button
                  class="btn btn-outline-primary"
                  (click)="viewProject.emit(project)"
                  [title]="'common.view' | translate">
                  <i class="fas fa-eye"></i>
                  <span class="d-none d-lg-inline ms-1">{{ 'common.view' | translate }}</span>
                </button>
                <button
                  class="btn btn-outline-secondary"
                  (click)="editProject.emit(project)"
                  [title]="'common.edit' | translate">
                  <i class="fas fa-edit"></i>
                  <span class="d-none d-lg-inline ms-1">{{ 'common.edit' | translate }}</span>
                </button>
                <button
                  class="btn btn-outline-danger"
                  (click)="deleteProject.emit(project)"
                  [title]="'common.delete' | translate">
                  <i class="fas fa-trash"></i>
                  <span class="d-none d-lg-inline ms-1">{{ 'common.delete' | translate }}</span>
                </button>
              </div>
            </td>
          </tr>
        }
      </tbody>
    </table>

    <!-- Table Footer Info -->
    <div class="d-flex justify-content-between align-items-center mt-3">
      <div class="text-muted">
        {{ 'common.showing' | translate }} {{ projects().length }} {{ 'common.items' | translate }}
      </div>
    </div>
  }
</div>
```

Create file: `frontend/project-tracker/src/app/features/projects/components/project-table/project-table.component.css`

```css
.table {
  margin-bottom: 0;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.sortable:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.sortable i {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.6;
}

.btn-link {
  text-decoration: none;
  color: var(--bs-primary);
}

.btn-link:hover {
  text-decoration: underline;
}

.text-truncate {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .btn-group .btn span {
    display: none;
  }
}
```

---

## 🎯 Step 4: Main Project List Component

Create file: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.ts`

```typescript
import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project, ProjectFilters } from '../../../../shared/models/project.model';
import { ProjectFiltersComponent } from '../project-filters/project-filters.component';
import { ProjectTableComponent } from '../project-table/project-table.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

/// <summary>
/// Main project list page component
/// Orchestrates filters, table, and data loading
/// </summary>
@Component({
  selector: 'app-project-list',
  imports: [CommonModule, ProjectFiltersComponent, ProjectTableComponent, TranslatePipe],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);

  protected readonly projects = this.projectService.getProjectsSignal();
  protected readonly loading = this.projectService.getLoadingSignal();
  protected readonly error = this.projectService.getErrorSignal();
  protected readonly totalCount = this.projectService.getTotalCountSignal();

  private readonly currentFilters = signal<ProjectFilters>({});

  ngOnInit(): void {
    this.loadProjects();
  }

  /// <summary>
  /// Load projects with current filters
  /// </summary>
  loadProjects(): void {
    this.projectService.getProjects(this.currentFilters()).subscribe();
  }

  /// <summary>
  /// Handle filter changes
  /// </summary>
  onFiltersChanged(filters: ProjectFilters): void {
    this.currentFilters.set(filters);
    this.loadProjects();
  }

  /// <summary>
  /// Navigate to create project page
  /// </summary>
  createProject(): void {
    this.router.navigate(['/projects/create']);
  }

  /// <summary>
  /// Navigate to project details
  /// </summary>
  viewProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }

  /// <summary>
  /// Navigate to edit project
  /// </summary>
  editProject(project: Project): void {
    this.router.navigate(['/projects', project.id, 'edit']);
  }

  /// <summary>
  /// Delete project with confirmation
  /// </summary>
  deleteProject(project: Project): void {
    if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
      this.projectService.deleteProject(project.id).subscribe({
        next: () => {
          this.loadProjects();
        },
        error: (error) => {
          console.error('Delete failed:', error);
          alert('Failed to delete project');
        }
      });
    }
  }
}
```

Create file: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.html`

```html
<div class="container-fluid py-4">
  <!-- Header -->
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h2 class="mb-1">{{ 'projects.title' | translate }}</h2>
      <p class="text-muted mb-0">
        {{ 'projects.manageProjects' | translate }}
      </p>
    </div>
    <button class="btn btn-primary" (click)="createProject()">
      <i class="fas fa-plus me-2"></i>
      {{ 'projects.addProject' | translate }}
    </button>
  </div>

  <!-- Error Message -->
  @if (error()) {
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error() }}
      <button type="button" class="btn-close" aria-label="Close"></button>
    </div>
  }

  <!-- Filters -->
  <app-project-filters (filtersChanged)="onFiltersChanged($event)"></app-project-filters>

  <!-- Data Table -->
  <div class="card">
    <div class="card-body p-0">
      <app-project-table
        [projects]="projects()"
        [loading]="loading()"
        (viewProject)="viewProject($event)"
        (editProject)="editProject($event)"
        (deleteProject)="deleteProject($event)">
      </app-project-table>
    </div>
  </div>

  <!-- Summary Footer -->
  <div class="mt-3 text-muted">
    <i class="fas fa-info-circle me-2"></i>
    {{ 'common.total' | translate }}: {{ totalCount() }} {{ 'projects.projects' | translate }}
  </div>
</div>
```

Create file: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.css`

```css
h2 {
  font-weight: 600;
  color: var(--bs-dark);
}

.btn-primary {
  font-weight: 500;
  padding: 0.625rem 1.25rem;
}

.card {
  border-radius: 8px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
```

---

## ✅ Summary

### **What We Built:**

1. ✅ **Project Filters Component**
   - Search with 300ms debounce
   - Status dropdown filter
   - Priority dropdown filter
   - Clear filters button
   - Active filters indicator

2. ✅ **Project Table Component**
   - Sortable columns (click to sort)
   - Responsive design (columns hide on smaller screens)
   - Status badges with colors
   - Priority stars display
   - Action buttons (view/edit/delete)
   - Loading and empty states

3. ✅ **Project List Page**
   - Orchestrates filters and table
   - Handles data loading
   - Error handling
   - Navigation to create/edit pages

### **Best Practices Applied:**
- ✅ OnPush change detection for performance
- ✅ Signals for reactive state
- ✅ Debounced search input
- ✅ Responsive Bootstrap design
- ✅ Loading/empty states
- ✅ Type-safe with interfaces
- ✅ Computed values for sorted data

---

**Next: [Module 10: Pagination & Export](./10_pagination_export.md)**
