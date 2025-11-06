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