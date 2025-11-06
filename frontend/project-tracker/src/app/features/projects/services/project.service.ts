import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { signal } from '@angular/core';
import { environment } from '../../../../environments/environment';

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