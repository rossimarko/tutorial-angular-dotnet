import { Component, Input, Output, EventEmitter, signal, ChangeDetectionStrategy, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

/// <summary>
/// Reusable modal component with Bootstrap 5.3 styling
/// NOT a form control - used for dialogs and confirmations
/// Supports content projection via ng-content
/// Programmatically creates/removes backdrop
/// Handles ESC key for closing
/// </summary>
@Component({
  selector: 'app-modal',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Modal {
  private platformId = inject(PLATFORM_ID);

  // Inputs
  @Input() title: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() closeButton: boolean = true;
  @Input() showFooter: boolean = true;
  @Input() confirmText: string = 'common.confirm';
  @Input() cancelText: string = 'common.cancel';
  @Input() confirmButtonClass: string = 'btn-primary';

  // Outputs
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<any>();

  // Internal state
  protected readonly isOpen = signal<boolean>(false);
  private backdropElement: HTMLElement | null = null;

  // Modal size class
  protected get modalSizeClass(): string {
    const sizeMap = {
      'sm': 'modal-sm',
      'md': '',
      'lg': 'modal-lg',
      'xl': 'modal-xl'
    };
    return sizeMap[this.size];
  }

  // Public methods
  open(): void {
    this.isOpen.set(true);
    this.createBackdrop();
    this.disableBodyScroll();
  }

  close(): void {
    this.isOpen.set(false);
    this.removeBackdrop();
    this.enableBodyScroll();
    this.onClose.emit();
  }

  confirm(data?: any): void {
    this.onConfirm.emit(data);
    this.close();
  }

  // ESC key handler
  @HostListener('document:keydown.escape')
  handleEscKey(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  // Private methods
  private createBackdrop(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.backdropElement = document.createElement('div');
    this.backdropElement.className = 'modal-backdrop fade show';
    document.body.appendChild(this.backdropElement);
  }

  private removeBackdrop(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.backdropElement) {
      this.backdropElement.remove();
      this.backdropElement = null;
    }
  }

  private disableBodyScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = this.getScrollbarWidth() + 'px';
  }

  private enableBodyScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  private getScrollbarWidth(): number {
    if (!isPlatformBrowser(this.platformId)) return 0;

    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.remove();

    return scrollbarWidth;
  }

  // Backdrop click handler
  onBackdropClick(event: MouseEvent): void {
    // Only close if clicking the backdrop itself, not the modal content
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  // Cleanup on destroy
  ngOnDestroy(): void {
    this.removeBackdrop();
    this.enableBodyScroll();
  }
}
