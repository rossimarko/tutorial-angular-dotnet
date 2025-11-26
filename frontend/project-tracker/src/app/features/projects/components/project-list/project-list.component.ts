import { Component, inject, signal, OnInit, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ExportService } from '../../../../shared/services/export.service';
import { LoggerService } from '../../../../shared/services/logger.service';
import { Project, PaginationParams } from '../../../../shared/models/project.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { LocalizedDatePipe } from '../../../../shared/pipes/localized-date.pipe';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/// <summary>
/// Project list page with server-side pagination, search, sorting, and export
/// </summary>
@Component({
  selector: 'app-project-list',
  imports: [
    ReactiveFormsModule,
    PaginationComponent,
    ConfirmDialogComponent,
    TranslatePipe,
    LocalizedDatePipe
  ],
  templateUrl: 'project-list.component.html',
  styleUrl: 'project-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly notificationService = inject(NotificationService);
  private readonly exportService = inject(ExportService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);

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
  protected readonly statuses = ['Active', 'OnHold', 'Completed', 'Cancelled'];

  // Current sort state
  protected currentSortBy = 'CreatedAt';
  protected currentSortDirection: 'asc' | 'desc' = 'desc';

  // Default page size - must match service default
  private readonly DEFAULT_PAGE_SIZE = 5;

  // Track current pagination state
  private readonly currentPagination = signal<PaginationParams>({
    pageNumber: 1,
    pageSize: this.DEFAULT_PAGE_SIZE,
    sortBy: 'CreatedAt',
    sortDirection: 'desc'
  });

  // Delete confirmation state
  protected readonly showDeleteConfirm = signal(false);
  protected readonly projectToDelete = signal<Project | null>(null);
  protected readonly deleting = signal(false);

  ngOnInit(): void {
    this.loadProjects();

    // Subscribe to search changes with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.resetPageAndLoad();
      });

    // Subscribe to status filter changes
    this.statusFilter.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.resetPageAndLoad();
      });
  }

  /// <summary>
  /// Load projects with current filters and pagination
  /// </summary>
  private loadProjects(): void {
    const filters = this.buildFilters();
    this.projectService.loadProjectsPaged(filters).subscribe({
      next: () => {
        // Data loaded, signals updated by service
      },
      error: (error: any) => {
        this.logger.error('Failed to load projects', error);
        this.notificationService.error('Error', 'Failed to load projects');
      }
    });
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
    this.projectToDelete.set(project);
    this.showDeleteConfirm.set(true);
  }

  /// <summary>
  /// Confirm delete
  /// </summary>
  confirmDelete(): void {
    const project = this.projectToDelete();
    if (!project) return;

    this.deleting.set(true);
    this.projectService.deleteProject(project.id).subscribe({
      next: () => {
        this.notificationService.success(
          'Success',
          `Project "${project.title}" deleted successfully`
        );
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
        this.projectToDelete.set(null);
        this.loadProjects();
      },
      error: (error: any) => {
        this.logger.error('Delete failed', error);
        this.notificationService.error(
          'Error',
          'Failed to delete project'
        );
        this.deleting.set(false);
      }
    });
  }

  /// <summary>
  /// Cancel delete
  /// </summary>
  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.projectToDelete.set(null);
  }

}