import { Directive, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';

/// <summary>
/// Directive to trap focus within an element (useful for modals)
/// Implements WCAG 2.1 keyboard navigation guidelines
/// </summary>
@Directive({
  selector: '[appFocusTrap]',
  standalone: true
})
export class FocusTrapDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;
  private boundHandleKeyDown: (event: KeyboardEvent) => void;

  constructor() {
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
  }

  ngOnInit(): void {
    this.setupFocusTrap();
  }

  ngOnDestroy(): void {
    this.el.nativeElement.removeEventListener('keydown', this.boundHandleKeyDown);
  }

  private setupFocusTrap(): void {
    const focusableElements = this.el.nativeElement.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      this.firstFocusableElement = focusableElements[0] as HTMLElement;
      this.lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      this.el.nativeElement.addEventListener('keydown', this.boundHandleKeyDown);

      // Focus first element
      setTimeout(() => this.firstFocusableElement?.focus(), 100);
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  }
}