import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { NotificationService, NotificationType } from '../../services/notification.service';

/// <summary>
/// Container component for displaying toast notifications
/// Uses signal-based state for automatic reactive updates
/// </summary>
@Component({
  selector: 'app-toast-container',
  imports: [],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  private readonly notificationService = inject(NotificationService);

  protected readonly toasts = this.notificationService.getToasts();

  /// <summary>
  /// Get Bootstrap class for toast type
  /// </summary>
  getToastClass(type: NotificationType): string {
    const classes: Record<NotificationType, string> = {
      success: 'bg-success text-white',
      error: 'bg-danger text-white',
      warning: 'bg-warning text-dark',
      info: 'bg-info text-white'
    };
    return classes[type];
  }

  /// <summary>
  /// Get icon for toast type
  /// </summary>
  getToastIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[type];
  }

  /// <summary>
  /// Close toast
  /// </summary>
  close(id: number): void {
    this.notificationService.remove(id);
  }
}
