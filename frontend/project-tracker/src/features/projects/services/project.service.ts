import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { environment } from '../../../environments/environment';

// Define the shape of your data
export interface Project {
  id: number;
  name: string;
  description: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'  // Make this service available everywhere
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/projects`;
  private readonly projects = signal<Project[]>([]);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);

  // Load all projects from API
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