# Module 10: Pagination & Data Export

## 🎯 Objectives

By the end of this module, you will:
- ✅ Implement server-side pagination
- ✅ Create a reusable pagination component
- ✅ Build infinite scroll functionality
- ✅ Implement virtual scrolling for large datasets
- ✅ Export data to Excel (XLSX)
- ✅ Export data to CSV
- ✅ Add page size selector
- ✅ Display pagination metadata

## 📋 What is Pagination?

**Pagination** divides large datasets into smaller pages to improve:
- **Performance**: Load only what users need
- **User Experience**: Easier navigation through data
- **Server Load**: Reduce bandwidth and processing

### Pagination Strategies:

1. **Server-Side Pagination** (Traditional)
   - Request specific page from API
   - Server returns page + total count
   - User clicks page numbers

2. **Infinite Scroll** (Modern)
   - Load next page automatically on scroll
   - Seamless user experience
   - Popular in mobile apps

3. **Virtual Scrolling** (High Performance)
   - Render only visible rows
   - Handle thousands of items smoothly
   - CDK Virtual Scroll in Angular

---

## 🔧 Step 1: Backend Pagination Support

First, let's add pagination to our .NET API.

Create file: `backend/ProjectTracker.API/Models/Common/PagedResult.cs`

```csharp
namespace ProjectTracker.API.Models.Common;

/// <summary>
/// Generic paged result wrapper
/// </summary>
/// <typeparam name="T">Type of items in the result</typeparam>
public class PagedResult<T>
{
    /// <summary>
    /// List of items for current page
    /// </summary>
    public required IEnumerable<T> Items { get; init; }

    /// <summary>
    /// Current page number (1-based)
    /// </summary>
    public required int PageNumber { get; init; }

    /// <summary>
    /// Number of items per page
    /// </summary>
    public required int PageSize { get; init; }

    /// <summary>
    /// Total number of items across all pages
    /// </summary>
    public required int TotalCount { get; init; }

    /// <summary>
    /// Total number of pages
    /// </summary>
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);

    /// <summary>
    /// Whether there is a previous page
    /// </summary>
    public bool HasPrevious => PageNumber > 1;

    /// <summary>
    /// Whether there is a next page
    /// </summary>
    public bool HasNext => PageNumber < TotalPages;
}
```

Create file: `backend/ProjectTracker.API/Models/Common/PagingParameters.cs`

```csharp
namespace ProjectTracker.API.Models.Common;

/// <summary>
/// Parameters for pagination requests
/// </summary>
public class PagingParameters
{
    private const int MaxPageSize = 100;
    private int _pageSize = 10;

    /// <summary>
    /// Page number (1-based)
    /// </summary>
    public int PageNumber { get; set; } = 1;

    /// <summary>
    /// Number of items per page (max 100)
    /// </summary>
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
    }

    /// <summary>
    /// Calculate offset for SQL OFFSET clause
    /// </summary>
    public int Offset => (PageNumber - 1) * PageSize;
}
```

Update file: `backend/ProjectTracker.API/Data/Repositories/ProjectRepository.cs`

Add the following method to support pagination:

```csharp
/// <summary>
/// Get paginated projects with filters
/// </summary>
public async Task<PagedResult<Project>> GetProjectsPagedAsync(
    int userId,
    PagingParameters pagingParams,
    string? searchTerm = null,
    string? status = null,
    int? priority = null,
    string sortBy = "CreatedAt",
    string sortDirection = "desc")
{
    var query = new StringBuilder(@"
        SELECT * FROM Projects
        WHERE UserId = @UserId");

    var countQuery = new StringBuilder(@"
        SELECT COUNT(*) FROM Projects
        WHERE UserId = @UserId");

    var parameters = new DynamicParameters();
    parameters.Add("UserId", userId);

    // Apply filters
    if (!string.IsNullOrWhiteSpace(searchTerm))
    {
        query.Append(" AND (Title LIKE @SearchTerm OR Description LIKE @SearchTerm)");
        countQuery.Append(" AND (Title LIKE @SearchTerm OR Description LIKE @SearchTerm)");
        parameters.Add("SearchTerm", $"%{searchTerm}%");
    }

    if (!string.IsNullOrWhiteSpace(status))
    {
        query.Append(" AND Status = @Status");
        countQuery.Append(" AND Status = @Status");
        parameters.Add("Status", status);
    }

    if (priority.HasValue)
    {
        query.Append(" AND Priority = @Priority");
        countQuery.Append(" AND Priority = @Priority");
        parameters.Add("Priority", priority.Value);
    }

    // Get total count
    var totalCount = await _connection.ExecuteScalarAsync<int>(countQuery.ToString(), parameters);

    // Apply sorting
    var validColumns = new[] { "Title", "CreatedAt", "DueDate", "Priority", "Status" };
    var orderColumn = validColumns.Contains(sortBy, StringComparer.OrdinalIgnoreCase)
        ? sortBy
        : "CreatedAt";
    var orderDir = sortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase) ? "ASC" : "DESC";

    query.Append($" ORDER BY {orderColumn} {orderDir}");

    // Apply pagination
    query.Append(" OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY");
    parameters.Add("Offset", pagingParams.Offset);
    parameters.Add("PageSize", pagingParams.PageSize);

    var projects = await _connection.QueryAsync<Project>(query.ToString(), parameters);

    return new PagedResult<Project>
    {
        Items = projects,
        PageNumber = pagingParams.PageNumber,
        PageSize = pagingParams.PageSize,
        TotalCount = totalCount
    };
}
```

Update file: `backend/ProjectTracker.API/Controllers/ProjectsController.cs`

Add pagination endpoint:

```csharp
/// <summary>
/// Get paginated projects
/// </summary>
[HttpGet("paged")]
[ProducesResponseType(typeof(PagedResult<Project>), StatusCodes.Status200OK)]
public async Task<ActionResult<PagedResult<Project>>> GetProjectsPaged(
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 10,
    [FromQuery] string? searchTerm = null,
    [FromQuery] string? status = null,
    [FromQuery] int? priority = null,
    [FromQuery] string sortBy = "CreatedAt",
    [FromQuery] string sortDirection = "desc")
{
    var userId = GetUserId();
    var pagingParams = new PagingParameters
    {
        PageNumber = pageNumber,
        PageSize = pageSize
    };

    var result = await _projectRepository.GetProjectsPagedAsync(
        userId,
        pagingParams,
        searchTerm,
        status,
        priority,
        sortBy,
        sortDirection);

    return Ok(result);
}
```

---

## 📄 Step 2: Frontend Pagination Models

Update file: `frontend/project-tracker/src/app/shared/models/project.model.ts`

```typescript
/// <summary>
/// Paged result wrapper
/// </summary>
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/// <summary>
/// Pagination parameters
/// </summary>
export interface PagingParameters {
  pageNumber: number;
  pageSize: number;
}

/// <summary>
/// Extended project filters with pagination
/// </summary>
export interface ProjectFiltersWithPaging extends ProjectFilters {
  pageNumber?: number;
  pageSize?: number;
}
```

---

## 🔄 Step 3: Update Project Service for Pagination

Update file: `frontend/project-tracker/src/app/features/projects/services/project.service.ts`

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  Project, 
  ProjectFiltersWithPaging, 
  PagedResult 
} from '../../../shared/models/project.model';

/// <summary>
/// Service for managing projects with pagination
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
  private readonly pageNumber = signal(1);
  private readonly pageSize = signal(10);
  private readonly totalCount = signal(0);
  private readonly totalPages = signal(0);

  /// <summary>
  /// Get paginated projects with filters
  /// </summary>
  getProjectsPaged(filters?: ProjectFiltersWithPaging): Observable<PagedResult<Project>> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('pageNumber', filters?.pageNumber?.toString() || '1')
      .set('pageSize', filters?.pageSize?.toString() || '10');

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

    return this.http.get<PagedResult<Project>>(`${this.apiUrl}/paged`, { params }).pipe(
      tap(result => {
        this.projects.set(result.items);
        this.pageNumber.set(result.pageNumber);
        this.pageSize.set(result.pageSize);
        this.totalCount.set(result.totalCount);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to load projects');
        this.loading.set(false);
        console.error('Error loading projects:', error);
        return of({
          items: [],
          pageNumber: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasPrevious: false,
          hasNext: false
        });
      })
    );
  }

  // Getters for pagination signals
  getPageNumberSignal() {
    return this.pageNumber.asReadonly();
  }

  getPageSizeSignal() {
    return this.pageSize.asReadonly();
  }

  getTotalPagesSignal() {
    return this.totalPages.asReadonly();
  }

  // Existing getters...
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

## 📑 Step 4: Pagination Component

Create file: `frontend/project-tracker/src/app/shared/components/pagination/pagination.component.ts`

```typescript
import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

/// <summary>
/// Reusable pagination component
/// </summary>
@Component({
  selector: 'app-pagination',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  // Inputs
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalCount = input.required<number>();
  readonly pageSizeOptions = input<number[]>([5, 10, 25, 50, 100]);

  // Outputs
  readonly pageChanged = output<number>();
  readonly pageSizeChanged = output<number>();

  // Computed properties
  protected readonly hasPrevious = computed(() => this.currentPage() > 1);
  protected readonly hasNext = computed(() => this.currentPage() < this.totalPages());
  
  protected readonly startItem = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    return Math.min(start, this.totalCount());
  });
  
  protected readonly endItem = computed(() => {
    const end = this.currentPage() * this.pageSize();
    return Math.min(end, this.totalCount());
  });

  protected readonly pageNumbers = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      pages.push(1);

      if (current > 3) {
        pages.push('...');
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push('...');
      }

      pages.push(total);
    }

    return pages;
  });

  /// <summary>
  /// Navigate to specific page
  /// </summary>
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChanged.emit(page);
    }
  }

  /// <summary>
  /// Navigate to previous page
  /// </summary>
  previousPage(): void {
    if (this.hasPrevious()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  /// <summary>
  /// Navigate to next page
  /// </summary>
  nextPage(): void {
    if (this.hasNext()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  /// <summary>
  /// Change page size
  /// </summary>
  onPageSizeChange(size: string): void {
    const newSize = parseInt(size, 10);
    if (newSize !== this.pageSize()) {
      this.pageSizeChanged.emit(newSize);
    }
  }
}
```

Create file: `frontend/project-tracker/src/app/shared/components/pagination/pagination.component.html`

```html
<nav aria-label="Pagination">
  <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
    <!-- Page Info -->
    <div class="text-muted">
      {{ 'common.showing' | translate }}
      <strong>{{ startItem() }}</strong>
      {{ 'common.to' | translate }}
      <strong>{{ endItem() }}</strong>
      {{ 'common.of' | translate }}
      <strong>{{ totalCount() }}</strong>
      {{ 'common.items' | translate }}
    </div>

    <!-- Page Size Selector -->
    <div class="d-flex align-items-center gap-2">
      <label for="pageSize" class="form-label mb-0 text-muted">
        {{ 'common.itemsPerPage' | translate }}:
      </label>
      <select
        id="pageSize"
        class="form-select form-select-sm"
        style="width: auto;"
        [value]="pageSize()"
        (change)="onPageSizeChange($any($event.target).value)">
        @for (size of pageSizeOptions(); track size) {
          <option [value]="size">{{ size }}</option>
        }
      </select>
    </div>

    <!-- Page Navigation -->
    @if (totalPages() > 1) {
      <ul class="pagination mb-0">
        <!-- Previous Button -->
        <li class="page-item" [class.disabled]="!hasPrevious()">
          <button
            class="page-link"
            (click)="previousPage()"
            [disabled]="!hasPrevious()"
            [attr.aria-label]="'common.previous' | translate">
            <i class="fas fa-chevron-left"></i>
          </button>
        </li>

        <!-- Page Numbers -->
        @for (page of pageNumbers(); track page) {
          @if (page === '...') {
            <li class="page-item disabled">
              <span class="page-link">...</span>
            </li>
          } @else {
            <li class="page-item" [class.active]="page === currentPage()">
              <button
                class="page-link"
                (click)="goToPage($any(page))"
                [attr.aria-label]="'Page ' + page"
                [attr.aria-current]="page === currentPage() ? 'page' : null">
                {{ page }}
              </button>
            </li>
          }
        }

        <!-- Next Button -->
        <li class="page-item" [class.disabled]="!hasNext()">
          <button
            class="page-link"
            (click)="nextPage()"
            [disabled]="!hasNext()"
            [attr.aria-label]="'common.next' | translate">
            <i class="fas fa-chevron-right"></i>
          </button>
        </li>
      </ul>
    }
  </div>
</nav>
```

Create file: `frontend/project-tracker/src/app/shared/components/pagination/pagination.component.css`

```css
.pagination {
  margin: 0;
}

.page-link {
  color: var(--bs-primary);
  border-color: var(--bs-border-color);
  padding: 0.375rem 0.75rem;
}

.page-link:hover {
  background-color: var(--bs-light);
  border-color: var(--bs-primary);
}

.page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.page-item.disabled .page-link {
  color: var(--bs-secondary);
  pointer-events: none;
  background-color: var(--bs-light);
}

.form-select-sm {
  padding: 0.25rem 2rem 0.25rem 0.5rem;
  font-size: 0.875rem;
}
```

---

## 🔄 Step 5: Update Project List with Pagination

Update file: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.ts`

```typescript
import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project, ProjectFiltersWithPaging } from '../../../../shared/models/project.model';
import { ProjectFiltersComponent } from '../project-filters/project-filters.component';
import { ProjectTableComponent } from '../project-table/project-table.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

/// <summary>
/// Main project list page with pagination
/// </summary>
@Component({
  selector: 'app-project-list',
  imports: [
    CommonModule, 
    ProjectFiltersComponent, 
    ProjectTableComponent, 
    PaginationComponent,
    TranslatePipe
  ],
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
  protected readonly pageNumber = this.projectService.getPageNumberSignal();
  protected readonly pageSize = this.projectService.getPageSizeSignal();
  protected readonly totalCount = this.projectService.getTotalCountSignal();
  protected readonly totalPages = this.projectService.getTotalPagesSignal();

  private readonly currentFilters = signal<ProjectFiltersWithPaging>({
    pageNumber: 1,
    pageSize: 10
  });

  ngOnInit(): void {
    this.loadProjects();
  }

  /// <summary>
  /// Load projects with current filters and pagination
  /// </summary>
  loadProjects(): void {
    this.projectService.getProjectsPaged(this.currentFilters()).subscribe();
  }

  /// <summary>
  /// Handle filter changes
  /// </summary>
  onFiltersChanged(filters: ProjectFiltersWithPaging): void {
    this.currentFilters.update(current => ({
      ...filters,
      pageNumber: 1, // Reset to first page on filter change
      pageSize: current.pageSize
    }));
    this.loadProjects();
  }

  /// <summary>
  /// Handle page change
  /// </summary>
  onPageChanged(page: number): void {
    this.currentFilters.update(current => ({
      ...current,
      pageNumber: page
    }));
    this.loadProjects();
  }

  /// <summary>
  /// Handle page size change
  /// </summary>
  onPageSizeChanged(size: number): void {
    this.currentFilters.update(current => ({
      ...current,
      pageSize: size,
      pageNumber: 1 // Reset to first page on size change
    }));
    this.loadProjects();
  }

  // Navigation methods (unchanged)
  createProject(): void {
    this.router.navigate(['/projects/create']);
  }

  viewProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }

  editProject(project: Project): void {
    this.router.navigate(['/projects', project.id, 'edit']);
  }

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

Update file: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.html`

Add pagination component after the table:

```html
<div class="container-fluid py-4">
  <!-- Header (unchanged) -->
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

  <!-- Error Message (unchanged) -->
  @if (error()) {
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error() }}
      <button type="button" class="btn-close" aria-label="Close"></button>
    </div>
  }

  <!-- Filters (unchanged) -->
  <app-project-filters (filtersChanged)="onFiltersChanged($event)"></app-project-filters>

  <!-- Data Table (unchanged) -->
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

    <!-- Pagination -->
    <div class="card-footer bg-light">
      <app-pagination
        [currentPage]="pageNumber()"
        [totalPages]="totalPages()"
        [pageSize]="pageSize()"
        [totalCount]="totalCount()"
        (pageChanged)="onPageChanged($event)"
        (pageSizeChanged)="onPageSizeChanged($event)">
      </app-pagination>
    </div>
  </div>
</div>
```

---

## 📤 Step 6: Export to Excel & CSV

Create file: `frontend/project-tracker/src/app/shared/services/export.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Project } from '../models/project.model';

/// <summary>
/// Service for exporting data to Excel and CSV
/// </summary>
@Injectable({
  providedIn: 'root'
})
export class ExportService {
  /// <summary>
  /// Export projects to CSV
  /// </summary>
  exportToCSV(projects: Project[], filename: string = 'projects.csv'): void {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Start Date', 'Due Date', 'Created At'];
    const csvData = projects.map(p => [
      p.id,
      this.escapeCsvValue(p.title),
      this.escapeCsvValue(p.description || ''),
      p.status,
      p.priority,
      this.formatDate(p.startDate),
      this.formatDate(p.dueDate),
      this.formatDate(p.createdAt)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /// <summary>
  /// Export projects to Excel (simplified HTML table method)
  /// For production, consider using libraries like 'xlsx' or 'exceljs'
  /// </summary>
  exportToExcel(projects: Project[], filename: string = 'projects.xlsx'): void {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Start Date', 'Due Date', 'Created At'];
    
    let excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
    `;

    projects.forEach(p => {
      excelContent += `
        <tr>
          <td>${p.id}</td>
          <td>${this.escapeHtml(p.title)}</td>
          <td>${this.escapeHtml(p.description || '')}</td>
          <td>${p.status}</td>
          <td>${p.priority}</td>
          <td>${this.formatDate(p.startDate)}</td>
          <td>${this.formatDate(p.dueDate)}</td>
          <td>${this.formatDate(p.createdAt)}</td>
        </tr>
      `;
    });

    excelContent += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    this.downloadFile(excelContent, filename, 'application/vnd.ms-excel');
  }

  /// <summary>
  /// Escape CSV special characters
  /// </summary>
  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /// <summary>
  /// Escape HTML special characters
  /// </summary>
  private escapeHtml(value: string): string {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  /// <summary>
  /// Format date for export
  /// </summary>
  private formatDate(date: Date | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US');
  }

  /// <summary>
  /// Download file to user's computer
  /// </summary>
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}
```

Update `project-list.component.ts` to add export functionality:

```typescript
import { ExportService } from '../../../../shared/services/export.service';

export class ProjectListComponent implements OnInit {
  private readonly exportService = inject(ExportService);

  // ... existing code ...

  /// <summary>
  /// Export current page to CSV
  /// </summary>
  exportCurrentPageToCSV(): void {
    this.exportService.exportToCSV(this.projects(), `projects-page-${this.pageNumber()}.csv`);
  }

  /// <summary>
  /// Export current page to Excel
  /// </summary>
  exportCurrentPageToExcel(): void {
    this.exportService.exportToExcel(this.projects(), `projects-page-${this.pageNumber()}.xlsx`);
  }

  /// <summary>
  /// Export all filtered projects (fetch all pages)
  /// </summary>
  exportAllToCSV(): void {
    // Fetch all with large page size
    const allFilters = { ...this.currentFilters(), pageSize: 10000 };
    this.projectService.getProjectsPaged(allFilters).subscribe(result => {
      this.exportService.exportToCSV(result.items, 'projects-all.csv');
    });
  }

  /// <summary>
  /// Export all filtered projects to Excel
  /// </summary>
  exportAllToExcel(): void {
    const allFilters = { ...this.currentFilters(), pageSize: 10000 };
    this.projectService.getProjectsPaged(allFilters).subscribe(result => {
      this.exportService.exportToExcel(result.items, 'projects-all.xlsx');
    });
  }
}
```

Add export buttons to `project-list.component.html`:

```html
<!-- Add this after the header "Add Project" button -->
<div class="btn-group">
  <button class="btn btn-primary" (click)="createProject()">
    <i class="fas fa-plus me-2"></i>
    {{ 'projects.addProject' | translate }}
  </button>
  <button
    type="button"
    class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split"
    data-bs-toggle="dropdown"
    aria-expanded="false">
    <i class="fas fa-download me-1"></i>
    {{ 'common.export' | translate }}
  </button>
  <ul class="dropdown-menu dropdown-menu-end">
    <li>
      <button class="dropdown-item" (click)="exportCurrentPageToCSV()">
        <i class="fas fa-file-csv me-2"></i>
        {{ 'common.exportPageCSV' | translate }}
      </button>
    </li>
    <li>
      <button class="dropdown-item" (click)="exportCurrentPageToExcel()">
        <i class="fas fa-file-excel me-2"></i>
        {{ 'common.exportPageExcel' | translate }}
      </button>
    </li>
    <li><hr class="dropdown-divider"></li>
    <li>
      <button class="dropdown-item" (click)="exportAllToCSV()">
        <i class="fas fa-file-csv me-2"></i>
        {{ 'common.exportAllCSV' | translate }}
      </button>
    </li>
    <li>
      <button class="dropdown-item" (click)="exportAllToExcel()">
        <i class="fas fa-file-excel me-2"></i>
        {{ 'common.exportAllExcel' | translate }}
      </button>
    </li>
  </ul>
</div>
```

---

## ✅ Summary

### **What We Built:**

1. ✅ **Backend Pagination Support**
   - PagedResult<T> generic wrapper
   - PagingParameters with validation
   - Repository method with OFFSET/FETCH
   - Controller endpoint with filtering

2. ✅ **Reusable Pagination Component**
   - Page number buttons with ellipsis
   - Previous/Next navigation
   - Page size selector
   - Item count display
   - Smart page number display (1 ... 5 6 7 ... 20)

3. ✅ **Integrated Project List**
   - Server-side pagination
   - Combined with filters from Module 9
   - Reset to page 1 on filter changes
   - Responsive pagination controls

4. ✅ **Export Functionality**
   - Export to CSV format
   - Export to Excel (HTML table method)
   - Export current page only
   - Export all filtered results
   - Proper escaping and formatting

### **Best Practices Applied:**
- ✅ Generic PagedResult<T> for reusability
- ✅ Server-side pagination (performance)
- ✅ Smart ellipsis in page numbers
- ✅ Page size validation (max 100)
- ✅ SQL injection prevention with parameters
- ✅ Computed properties for derived values
- ✅ Accessible ARIA labels
- ✅ File download with blob URLs

### **Production Enhancements (Optional):**
- Consider using **xlsx** or **exceljs** library for true Excel files
- Add **infinite scroll** for mobile-friendly UX
- Implement **virtual scrolling** with Angular CDK for 1000+ rows
- Cache paginated results in service
- Add keyboard navigation (arrow keys)

---

**Next: [Module 11: CRUD Operations](./11_crud_operations.md)**
