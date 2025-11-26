import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';

/// <summary>
/// Reusable pagination component for displaying page navigation
/// Supports dynamic page number display with ellipsis for large page counts
/// </summary>
@Component({
  selector: 'app-pagination',
  imports: [TranslatePipe],
  templateUrl: 'pagination.component.html',
  styleUrl: 'pagination.component.scss',
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
  onPageSizeChange(size: string | number): void {
    const newSize = typeof size === 'string' ? parseInt(size, 10) : size;
    if (!isNaN(newSize) && newSize !== this.pageSize()) {
      this.pageSizeChanged.emit(newSize);
    }
  }
}
