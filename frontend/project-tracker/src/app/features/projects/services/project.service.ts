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

  // Default page size - must match component default
  private readonly DEFAULT_PAGE_SIZE = 5;

  // State signals for pagination
  private readonly projects = signal<Project[]>([]);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);
  private readonly pageNumber = signal(1);
  private readonly pageSize = signal(this.DEFAULT_PAGE_SIZE);
  private readonly totalCount = signal(0);
  private readonly totalPages = signal(0);

  /// <summary>
  /// Load paginated projects with optional filters
  /// Supports searching, sorting, and filtering
  /// </summary>
  loadProjectsPaged(filters?: Partial<PaginationParams>): Observable<ProjectPaginatedResponse> {
    this.loading.set(true);
    this.error.set(null);

    // Extract and pre-set pagination parameters to ensure immediate signal updates
    const pageNumber = filters?.pageNumber ?? 1;
    const pageSize = filters?.pageSize ?? this.DEFAULT_PAGE_SIZE;
    
    // Pre-set signals immediately to ensure UI reflects current page/size state
    this.pageNumber.set(pageNumber);
    this.pageSize.set(pageSize);

    // Build query parameters from filters
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

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
          pageNumber: pageNumber,
          pageSize: pageSize,
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