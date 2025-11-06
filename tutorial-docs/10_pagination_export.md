# Module 10: Pagination & Data Export

## 🎯 Objectives

By the end of this module, you will:
- ✅ Understand the existing server-side pagination implementation
- ✅ Create a reusable pagination component
- ✅ Integrate pagination into the project list
- ✅ Implement data export to CSV and Excel
- ✅ Add page size selector
- ✅ Display pagination metadata

## 📋 What is Pagination?

**Pagination** divides large datasets into smaller pages to improve:
- **Performance**: Load only what users need
- **User Experience**: Easier navigation through data
- **Server Load**: Reduce bandwidth and processing

### Our Implementation:

We use **Server-Side Pagination** (Traditional):
- Request specific page from API with filters
- Server returns page data + total count
- User navigates through page numbers
- Implemented with SQL `OFFSET...FETCH` for efficiency

---

## ✅ Step 1: Backend Pagination Support (Already Implemented)

The backend already has pagination support implemented. Here's what exists:

### Backend Models: `backend/ProjectTracker.API/Models/Common/PaginationModel.cs`

```csharp
/// <summary>
/// Pagination request parameters
/// </summary>
public class PaginationRequest
{
    private const int MaxPageSize = 100;
    private const int DefaultPageSize = 10;

    public int PageNumber { get; set; } = 1;
    
    private int _pageSize = DefaultPageSize;
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value < 1 ? DefaultPageSize : value;
    }

    public string? SearchTerm { get; set; }
    public string? SortBy { get; set; }
    public string SortDirection { get; set; } = "asc";
}

/// <summary>
/// Paginated response - generic wrapper for any paginated data
/// </summary>
public class PaginatedResponse<T>
{
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    
    /// <summary>
    /// Calculated total pages based on TotalCount and PageSize
    /// </summary>
    public int TotalPages => (TotalCount + PageSize - 1) / PageSize;
    
    public bool HasNextPage => PageNumber < TotalPages;
    public bool HasPreviousPage => PageNumber > 1;
    public required List<T> Items { get; set; }

    /// <summary>
    /// Factory method to create a paginated response
    /// </summary>
    public static PaginatedResponse<T> Create(
        int pageNumber,
        int pageSize,
        int totalCount,
        List<T> items)
    {
        return new()
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            Items = items
        };
    }
}

/// <summary>
/// Response for infinite scroll pagination (optional alternative)
/// </summary>
public class InfiniteScrollResponse<T>
{
    public required List<T> Items { get; set; }
    public bool HasMore { get; set; }
    public int TotalCount { get; set; }

    public static InfiniteScrollResponse<T> Create(
        List<T> items,
        int totalCount,
        int pageSize)
    {
        return new()
        {
            Items = items,
            TotalCount = totalCount,
            HasMore = items.Count < totalCount
        };
    }
}
```

### Backend Repository: `backend/ProjectTracker.API/Data/Repositories/ProjectRepository.cs`

The `GetPagedAsync()` method handles pagination:

```csharp
public async Task<(IEnumerable<Project> items, int total)> GetPagedAsync(
    int userId,
    PaginationRequest request)
{
    using var connection = await _dbConnection.CreateConnectionAsync();

    // Build WHERE clause with search term support
    var whereClause = new StringBuilder("WHERE [UserId] = @UserId");
    var parameters = new DynamicParameters();
    parameters.Add("@UserId", userId);

    if (!string.IsNullOrWhiteSpace(request.SearchTerm))
    {
        whereClause.Append(" AND ([Title] LIKE @SearchTerm OR [Description] LIKE @SearchTerm)");
        parameters.Add("@SearchTerm", $"%{request.SearchTerm}%");
    }

    // Get total count for pagination calculation
    var countSql = $"SELECT COUNT(*) FROM [Projects] {whereClause}";
    var total = await connection.QuerySingleAsync<int>(countSql, parameters);

    // Get paged data using OFFSET...FETCH (SQL Server best practice)
    var offset = (request.PageNumber - 1) * request.PageSize;
    var sortColumn = GetSafeSortColumn(request.SortBy);
    var sortDirection = request.SortDirection.ToLower() == "desc" ? "DESC" : "ASC";

    var sql = $@"
        SELECT [Id], [UserId], [Title], [Description], [Status], [Priority],
               [StartDate], [DueDate], [CreatedAt], [UpdatedAt]
        FROM [Projects]
        {whereClause}
        ORDER BY [{sortColumn}] {sortDirection}
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY";

    parameters.Add("@Offset", offset);
    parameters.Add("@PageSize", request.PageSize);

    var projects = await connection.QueryAsync<Project>(sql, parameters);
    return (projects, total);
}
```

### Backend API Endpoint: `backend/ProjectTracker.API/Controllers/ProjectsController.cs`

The `/api/projects/paged` endpoint is already implemented:

```csharp
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
```

---

## 📄 Step 2: Create Frontend Pagination Models

Create file: `frontend/project-tracker/src/app/shared/models/project.model.ts`

```typescript
/// <summary>
/// Project entity model
/// </summary>
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

/// <summary>
/// Request to create a new project
/// </summary>
export interface CreateProjectRequest {
  title: string;
  description?: string;
  status: string;
  priority: number;
  startDate?: Date;
  dueDate?: Date;
}

/// <summary>
/// Request to update an existing project
/// </summary>
export interface UpdateProjectRequest extends CreateProjectRequest {}

/// <summary>
/// Paged result wrapper - matches backend response structure
/// </summary>
export interface PaginatedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  items: T[];
}

/// <summary>
/// Project-specific pagination type
/// </summary>
export type ProjectPaginatedResponse = PaginatedResponse<Project>;

/// <summary>
/// Pagination parameters for API requests
/// </summary>
export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/// <summary>
/// Project filters with pagination
/// </summary>
export interface ProjectFilters extends PaginationParams {
  status?: string;
  priority?: number;
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
  ProjectPaginatedResponse,
  PaginationParams,
  CreateProjectRequest,
  UpdateProjectRequest
} from '../../../shared/models/project.model';

/// <summary>
/// Service for managing projects with pagination support
/// Uses signals for state management and server-side pagination
/// </summary>
@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  // State signals for pagination
  private readonly projects = signal<Project[]>([]);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);
  private readonly pageNumber = signal(1);
  private readonly pageSize = signal(10);
  private readonly totalCount = signal(0);
  private readonly totalPages = signal(0);

  /// <summary>
  /// Load paginated projects with optional filters
  /// Supports searching, sorting, and filtering
  /// </summary>
  loadProjectsPaged(filters?: Partial<PaginationParams>): Observable<ProjectPaginatedResponse> {
    this.loading.set(true);
    this.error.set(null);

    // Build query parameters from filters
    let params = new HttpParams()
      .set('pageNumber', (filters?.pageNumber ?? 1).toString())
      .set('pageSize', (filters?.pageSize ?? 10).toString());

    if (filters?.searchTerm) {
      params = params.set('searchTerm', filters.searchTerm);
    }
    if (filters?.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters?.sortDirection) {
      params = params.set('sortDirection', filters.sortDirection);
    }

    return this.http.get<ProjectPaginatedResponse>(`${this.apiUrl}/paged`, { params }).pipe(
      tap(response => {
        this.updatePaginationState(response);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to load projects');
        this.loading.set(false);
        console.error('Error loading projects:', error);
        
        // Return empty response on error
        return of({
          items: [],
          pageNumber: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false
        });
      })
    );
  }

  /// <summary>
  /// Update internal pagination state from response
  /// </summary>
  private updatePaginationState(response: ProjectPaginatedResponse): void {
    this.projects.set(response.items);
    this.pageNumber.set(response.pageNumber);
    this.pageSize.set(response.pageSize);
    this.totalCount.set(response.totalCount);
    this.totalPages.set(response.totalPages);
  }

  /// <summary>
  /// Create a new project
  /// </summary>
  createProject(request: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, request).pipe(
      tap(() => {
        this.error.set(null);
      }),
      catchError(error => {
        this.error.set('Failed to create project');
        console.error('Error creating project:', error);
        throw error;
      })
    );
  }

  /// <summary>
  /// Get a single project by ID
  /// </summary>
  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  /// <summary>
  /// Update an existing project
  /// </summary>
  updateProject(id: number, request: UpdateProjectRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request).pipe(
      tap(() => {
        this.error.set(null);
      }),
      catchError(error => {
        this.error.set('Failed to update project');
        console.error('Error updating project:', error);
        throw error;
      })
    );
  }

  /// <summary>
  /// Delete a project
  /// </summary>
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.error.set(null);
      }),
      catchError(error => {
        this.error.set('Failed to delete project');
        console.error('Error deleting project:', error);
        throw error;
      })
    );
  }

  /// <summary>
  /// Read-only signal accessors for template binding
  /// </summary>
  getProjectsSignal() {
    return this.projects.asReadonly();
  }

  getLoadingSignal() {
    return this.loading.asReadonly();
  }

  getErrorSignal() {
    return this.error.asReadonly();
  }

  getPageNumberSignal() {
    return this.pageNumber.asReadonly();
  }

  getPageSizeSignal() {
    return this.pageSize.asReadonly();
  }

  getTotalCountSignal() {
    return this.totalCount.asReadonly();
  }

  getTotalPagesSignal() {
    return this.totalPages.asReadonly();
  }
}
```

---

## 📑 Step 4: Create Pagination Component

Create file: `frontend/project-tracker/src/app/shared/components/pagination/pagination.component.ts`

```typescript
import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

/// <summary>
/// Reusable pagination component for displaying page navigation
/// Supports dynamic page number display with ellipsis for large page counts
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

  // Computed properties for template logic
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

  /// <summary>
  /// Compute page numbers to display with smart ellipsis handling
  /// Shows all pages if <= 7, otherwise shows first, last, and neighbors of current page
  /// </summary>
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
  /// Change page size and emit change event
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
<nav aria-label="Pagination Navigation" class="d-flex justify-content-between align-items-center flex-wrap gap-3 py-3">
  <!-- Items count display -->
  <div class="text-muted small">
    {{ 'common.showing' | translate }}
    <strong>{{ startItem() }}</strong>
    {{ 'common.to' | translate }}
    <strong>{{ endItem() }}</strong>
    {{ 'common.of' | translate }}
    <strong>{{ totalCount() }}</strong>
    {{ 'common.items' | translate }}
  </div>

  <!-- Page size selector -->
  <div class="d-flex align-items-center gap-2">
    <label for="pageSize" class="form-label mb-0 text-muted small">
      {{ 'common.itemsPerPage' | translate }}:
    </label>
    <select
      id="pageSize"
      class="form-select form-select-sm"
      style="width: auto; min-width: 80px;"
      [value]="pageSize()"
      (change)="onPageSizeChange($any($event.target).value)"
      [attr.aria-label]="'common.pageSize' | translate">
      @for (size of pageSizeOptions(); track size) {
        <option [value]="size">{{ size }}</option>
      }
    </select>
  </div>

  <!-- Page navigation -->
  @if (totalPages() > 1) {
    <ul class="pagination mb-0">
      <!-- Previous button -->
      <li class="page-item" [class.disabled]="!hasPrevious()">
        <button
          type="button"
          class="page-link"
          (click)="previousPage()"
          [disabled]="!hasPrevious()"
          [attr.aria-label]="'common.previous' | translate">
          <i class="fas fa-chevron-left"></i>
        </button>
      </li>

      <!-- Page numbers -->
      @for (page of pageNumbers(); track page) {
        @if (page === '...') {
          <li class="page-item disabled">
            <span class="page-link">{{ page }}</span>
          </li>
        } @else {
          <li class="page-item" [class.active]="page === currentPage()">
            <button
              type="button"
              class="page-link"
              (click)="goToPage($any(page))"
              [attr.aria-label]="'Page ' + page"
              [attr.aria-current]="page === currentPage() ? 'page' : null">
              {{ page }}
            </button>
          </li>
        }
      }

      <!-- Next button -->
      <li class="page-item" [class.disabled]="!hasNext()">
        <button
          type="button"
          class="page-link"
          (click)="nextPage()"
          [disabled]="!hasNext()"
          [attr.aria-label]="'common.next' | translate">
          <i class="fas fa-chevron-right"></i>
        </button>
      </li>
    </ul>
  }
</nav>
```

Create file: `frontend/project-tracker/src/app/shared/components/pagination/pagination.component.css`

```css
.pagination {
  margin: 0;
  flex-wrap: nowrap;
}

.page-link {
  color: var(--bs-primary);
  border-color: var(--bs-border-color);
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
}

.page-link:hover:not(:disabled) {
  background-color: var(--bs-light);
  border-color: var(--bs-primary);
  color: var(--bs-primary);
}

.page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: white;
}

.page-item.disabled .page-link {
  color: var(--bs-secondary);
  pointer-events: none;
  background-color: var(--bs-light);
  cursor: not-allowed;
}

.form-select-sm {
  padding: 0.25rem 2rem 0.25rem 0.5rem;
  font-size: 0.875rem;
}

nav {
  border-top: 1px solid var(--bs-border-color);
}
```

---

## 📤 Step 5: Export Service

Create file: `frontend/project-tracker/src/app/shared/services/export.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Project } from '../models/project.model';

/// <summary>
/// Service for exporting project data to CSV and Excel formats
/// </summary>
@Injectable({
  providedIn: 'root'
})
export class ExportService {
  /// <summary>
  /// Export projects to CSV format
  /// CSV is widely compatible and suitable for data analysis
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
  /// Export projects to Excel format
  /// Uses HTML table approach - suitable for basic Excel files
  /// For production with complex formatting, consider using 'xlsx' or 'exceljs' libraries
  /// </summary>
  exportToExcel(projects: Project[], filename: string = 'projects.xlsx'): void {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Start Date', 'Due Date', 'Created At'];
    
    let excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #999; padding: 8px; text-align: left; }
            th { background-color: #0d6efd; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${this.escapeHtml(h)}</th>`).join('')}</tr>
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
  /// Escape CSV special characters (comma, quote, newline)
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
  /// Format date to locale string (MM/DD/YYYY)
  /// </summary>
  private formatDate(date: Date | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US');
  }

  /// <summary>
  /// Download file to user's computer using blob and link
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

---

## 🔄 Step 6: Update Project List Component with Pagination

Update file: `frontend/project-tracker/src/app/features/projects/services/project.service.ts`

First, check if this file needs to be completely replaced. The current file might not have all the pagination methods. Replace it with the content from Step 3 above.

Update file: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.ts`

Replace with this implementation that includes pagination and export:

```typescript
import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { ExportService } from '../../../../shared/services/export.service';
import { Project, PaginationParams } from '../../../../shared/models/project.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/// <summary>
/// Project list page with server-side pagination, search, sorting, and export
/// </summary>
@Component({
  selector: 'app-project-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaginationComponent,
    TranslatePipe
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly exportService = inject(ExportService);
  private readonly router = inject(Router);

  // Read-only signals from service
  protected readonly projects = this.projectService.getProjectsSignal();
  protected readonly loading = this.projectService.getLoadingSignal();
  protected readonly error = this.projectService.getErrorSignal();
  protected readonly pageNumber = this.projectService.getPageNumberSignal();
  protected readonly pageSize = this.projectService.getPageSizeSignal();
  protected readonly totalCount = this.projectService.getTotalCountSignal();
  protected readonly totalPages = this.projectService.getTotalPagesSignal();

  // Form controls for search
  protected readonly searchControl = new FormControl('');
  protected readonly statusFilter = new FormControl('');
  protected readonly statuses = ['Active', 'Pending', 'Completed', 'Cancelled'];

  // Current sort state
  protected currentSortBy = 'CreatedAt';
  protected currentSortDirection: 'asc' | 'desc' = 'desc';

  // Track current pagination state
  private readonly currentPagination = signal<PaginationParams>({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'CreatedAt',
    sortDirection: 'desc'
  });

  ngOnInit(): void {
    this.loadProjects();

    // Subscribe to search changes with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.resetPageAndLoad();
      });

    // Subscribe to status filter changes
    this.statusFilter.valueChanges.subscribe(() => {
      this.resetPageAndLoad();
    });
  }

  /// <summary>
  /// Load projects with current filters and pagination
  /// </summary>
  private loadProjects(): void {
    const filters = this.buildFilters();
    this.projectService.loadProjectsPaged(filters).subscribe();
  }

  /// <summary>
  /// Reset to page 1 and reload (used when filters change)
  /// </summary>
  private resetPageAndLoad(): void {
    this.currentPagination.update(current => ({
      ...current,
      pageNumber: 1
    }));
    this.loadProjects();
  }

  /// <summary>
  /// Build filter object from form controls and internal state
  /// </summary>
  private buildFilters(): Partial<PaginationParams> {
    const pagination = this.currentPagination();
    const filters: Partial<PaginationParams> = {
      ...pagination,
      searchTerm: this.searchControl.value || undefined
    };

    if (this.statusFilter.value) {
      (filters as any).status = this.statusFilter.value;
    }

    return filters;
  }

  /// <summary>
  /// Handle page navigation
  /// </summary>
  onPageChanged(page: number): void {
    this.currentPagination.update(current => ({
      ...current,
      pageNumber: page
    }));
    this.loadProjects();
  }

  /// <summary>
  /// Handle page size change
  /// </summary>
  onPageSizeChanged(size: number): void {
    this.currentPagination.update(current => ({
      ...current,
      pageSize: size,
      pageNumber: 1
    }));
    this.loadProjects();
  }

  /// <summary>
  /// Sort by column
  /// </summary>
  sortByColumn(column: 'Title' | 'Status' | 'Priority' | 'DueDate' | 'CreatedAt'): void {
    if (this.currentSortBy === column) {
      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortBy = column;
      this.currentSortDirection = 'asc';
    }

    this.currentPagination.update(current => ({
      ...current,
      sortBy: this.currentSortBy,
      sortDirection: this.currentSortDirection,
      pageNumber: 1
    }));
    this.loadProjects();
  }

  /// <summary>
  /// Get sort indicator for table header
  /// </summary>
  getSortIndicator(column: string): string {
    if (this.currentSortBy !== column) return '';
    return this.currentSortDirection === 'asc' ? ' ↑' : ' ↓';
  }

  /// <summary>
  /// Export current page to CSV
  /// </summary>
  exportCurrentPageToCSV(): void {
    this.exportService.exportToCSV(
      this.projects(),
      `projects-page-${this.pageNumber()}.csv`
    );
  }

  /// <summary>
  /// Export current page to Excel
  /// </summary>
  exportCurrentPageToExcel(): void {
    this.exportService.exportToExcel(
      this.projects(),
      `projects-page-${this.pageNumber()}.xlsx`
    );
  }

  /// <summary>
  /// Export all filtered projects to CSV (fetches with large page size)
  /// </summary>
  exportAllToCSV(): void {
    const allFilters = {
      ...this.buildFilters(),
      pageSize: 10000
    };
    this.projectService.loadProjectsPaged(allFilters).subscribe(result => {
      this.exportService.exportToCSV(result.items, 'projects-all.csv');
    });
  }

  /// <summary>
  /// Export all filtered projects to Excel
  /// </summary>
  exportAllToExcel(): void {
    const allFilters = {
      ...this.buildFilters(),
      pageSize: 10000
    };
    this.projectService.loadProjectsPaged(allFilters).subscribe(result => {
      this.exportService.exportToExcel(result.items, 'projects-all.xlsx');
    });
  }

  /// <summary>
  /// Navigate to create project page
  /// </summary>
  createProject(): void {
    this.router.navigate(['/projects/create']);
  }

  /// <summary>
  /// View project details
  /// </summary>
  viewProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }

  /// <summary>
  /// Edit project
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
        }
      });
    }
  }
}
```

Update file: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.html`

Replace with:

```html
<div class="container-fluid py-4">
  <!-- Header -->
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h2 class="mb-1">{{ 'projects.title' | translate }}</h2>
      <p class="text-muted mb-0">{{ 'projects.manageProjects' | translate }}</p>
    </div>
    
    <div class="btn-group" role="group">
      <button type="button" class="btn btn-primary" (click)="createProject()">
        <i class="fas fa-plus me-2"></i>
        {{ 'projects.addProject' | translate }}
      </button>
      
      <!-- Export dropdown -->
      <button
        type="button"
        class="btn btn-outline-secondary dropdown-toggle"
        data-bs-toggle="dropdown"
        aria-expanded="false">
        <i class="fas fa-download me-1"></i>
        {{ 'common.export' | translate }}
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li>
          <button type="button" class="dropdown-item" (click)="exportCurrentPageToCSV()">
            <i class="fas fa-file-csv me-2"></i>
            {{ 'common.exportPageCSV' | translate }}
          </button>
        </li>
        <li>
          <button type="button" class="dropdown-item" (click)="exportCurrentPageToExcel()">
            <i class="fas fa-file-excel me-2"></i>
            {{ 'common.exportPageExcel' | translate }}
          </button>
        </li>
        <li><hr class="dropdown-divider"></li>
        <li>
          <button type="button" class="dropdown-item" (click)="exportAllToCSV()">
            <i class="fas fa-file-csv me-2"></i>
            {{ 'common.exportAllCSV' | translate }}
          </button>
        </li>
        <li>
          <button type="button" class="dropdown-item" (click)="exportAllToExcel()">
            <i class="fas fa-file-excel me-2"></i>
            {{ 'common.exportAllExcel' | translate }}
          </button>
        </li>
      </ul>
    </div>
  </div>

  <!-- Error Message -->
  @if (error()) {
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error() }}
      <button type="button" class="btn-close"></button>
    </div>
  }

  <!-- Search and Filter Controls -->
  <div class="card mb-3">
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-6">
          <label for="search" class="form-label">{{ 'common.search' | translate }}</label>
          <input
            id="search"
            type="text"
            class="form-control"
            placeholder="{{ 'projects.searchPlaceholder' | translate }}"
            [formControl]="searchControl">
        </div>
        <div class="col-md-6">
          <label for="status" class="form-label">{{ 'common.status' | translate }}</label>
          <select id="status" class="form-select" [formControl]="statusFilter">
            <option value="">{{ 'common.all' | translate }}</option>
            @for (status of statuses; track status) {
              <option [value]="status">{{ status }}</option>
            }
          </select>
        </div>
      </div>
    </div>
  </div>

  <!-- Data Table Card -->
  <div class="card">
    <!-- Table -->
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th style="cursor: pointer;" (click)="sortByColumn('Title')">
              {{ 'projects.title' | translate }}{{ getSortIndicator('Title') }}
            </th>
            <th style="cursor: pointer;" (click)="sortByColumn('Status')">
              {{ 'common.status' | translate }}{{ getSortIndicator('Status') }}
            </th>
            <th style="cursor: pointer;" (click)="sortByColumn('Priority')">
              {{ 'projects.priority' | translate }}{{ getSortIndicator('Priority') }}
            </th>
            <th style="cursor: pointer;" (click)="sortByColumn('DueDate')">
              {{ 'projects.dueDate' | translate }}{{ getSortIndicator('DueDate') }}
            </th>
            <th style="cursor: pointer;" (click)="sortByColumn('CreatedAt')">
              {{ 'projects.createdAt' | translate }}{{ getSortIndicator('CreatedAt') }}
            </th>
            <th>{{ 'common.actions' | translate }}</th>
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            <tr>
              <td colspan="6" class="text-center py-4">
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">{{ 'common.loading' | translate }}</span>
                </div>
              </td>
            </tr>
          } @else if (projects().length === 0) {
            <tr>
              <td colspan="6" class="text-center py-4 text-muted">
                {{ 'projects.noProjects' | translate }}
              </td>
            </tr>
          } @else {
            @for (project of projects(); track project.id) {
              <tr>
                <td class="fw-medium">{{ project.title }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-success': project.status === 'Active',
                    'bg-warning': project.status === 'Pending',
                    'bg-info': project.status === 'Completed',
                    'bg-danger': project.status === 'Cancelled'
                  }">
                    {{ project.status }}
                  </span>
                </td>
                <td>{{ project.priority }}</td>
                <td>{{ project.dueDate | date:'short' }}</td>
                <td>{{ project.createdAt | date:'short' }}</td>
                <td>
                  <div class="btn-group btn-group-sm" role="group">
                    <button
                      type="button"
                      class="btn btn-outline-primary"
                      (click)="viewProject(project)"
                      title="{{ 'common.view' | translate }}">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      (click)="editProject(project)"
                      title="{{ 'common.edit' | translate }}">
                      <i class="fas fa-pencil"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-danger"
                      (click)="deleteProject(project)"
                      title="{{ 'common.delete' | translate }}">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
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

## ✅ Summary

### **What We Implemented:**

1. ✅ **Backend Pagination** (Already existed)
   - `PaginatedResponse<T>` generic wrapper
   - `PaginationRequest` with validation
   - Repository using `OFFSET...FETCH`
   - Controller `/api/projects/paged` endpoint

2. ✅ **Frontend Models**
   - `Project` interface
   - `PaginatedResponse<T>` interface
   - `PaginationParams` interface

3. ✅ **Reusable Pagination Component**
   - Page navigation with smart ellipsis
   - Previous/Next buttons
   - Page size selector
   - Item count display
   - Fully accessible with ARIA labels

4. ✅ **Updated Project Service**
   - `loadProjectsPaged()` method
   - Pagination state signals
   - Error handling and logging

5. ✅ **Integrated Project List**
   - Server-side pagination support
   - Search and filtering
   - Column-based sorting
   - Responsive table design

6. ✅ **Export Functionality**
   - CSV export with proper escaping
   - Excel export using HTML table method
   - Export current page or all results
   - User-friendly download experience

### **Best Practices Applied:**
- ✅ Server-side pagination for performance
- ✅ Generic `PaginatedResponse<T>` for reusability
- ✅ Signals for state management
- ✅ OnPush change detection
- ✅ Proper error handling and logging
- ✅ Accessible components with ARIA labels
- ✅ Bootstrap 5.3 for consistent styling
- ✅ Internationalization support
- ✅ Type safety with TypeScript interfaces

### **Next Steps (Optional Enhancements):**
- Consider **xlsx** or **exceljs** library for advanced Excel formatting
- Implement **infinite scroll** for mobile-friendly UX
- Add **virtual scrolling** with Angular CDK for 1000+ rows
- Cache paginated results in service
- Add keyboard navigation (arrow keys)
- Implement **column-level filtering**

---

**Next: [Module 11: CRUD Operations](./11_crud_operations.md)**
