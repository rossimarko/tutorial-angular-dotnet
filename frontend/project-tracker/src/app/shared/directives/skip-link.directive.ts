import { Directive, ElementRef, inject } from '@angular/core';

/// <summary>
/// Directive for skip-to-content links (accessibility)
/// Allows keyboard users to bypass navigation
/// </summary>
@Directive({
  selector: '[appSkipLink]',
  host: {
    '(click)': 'onClick($event)'
  }
})
export class SkipLinkDirective {
  private readonly el = inject(ElementRef);

  onClick(event: Event): void {
    event.preventDefault();
    const targetId = this.el.nativeElement.getAttribute('href')?.substring(1);
    if (targetId) {
      const target = document.getElementById(targetId);
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}