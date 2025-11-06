import { Injectable, signal } from '@angular/core';

/// <summary>
/// Toast notification type
/// </summary>
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/// <summary>
/// Toast notification model
/// </summary>
export interface Toast {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  duration: number;
}

/// <summary>
/// Service for displaying toast notifications
/// Manages notification state using signals for reactive updates
/// </summary>
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  /// <summary>
  /// Get current toasts as readonly signal
  /// </summary>
  getToasts() {
    return this.toasts.asReadonly();
  }

  /// <summary>
  /// Show success notification
  /// </summary>
  success(title: string, message: string, duration: number = 3000): void {
    this.show('success', title, message, duration);
  }

  /// <summary>
  /// Show error notification
  /// </summary>
  error(title: string, message: string, duration: number = 5000): void {
    this.show('error', title, message, duration);
  }

  /// <summary>
  /// Show warning notification
  /// </summary>
  warning(title: string, message: string, duration: number = 4000): void {
    this.show('warning', title, message, duration);
  }

  /// <summary>
  /// Show info notification
  /// </summary>
  info(title: string, message: string, duration: number = 3000): void {
    this.show('info', title, message, duration);
  }

  /// <summary>
  /// Show notification
  /// </summary>
  private show(type: NotificationType, title: string, message: string, duration: number): void {
    const toast: Toast = {
      id: this.nextId++,
      type,
      title,
      message,
      duration
    };

    this.toasts.update(toasts => [...toasts, toast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  /// <summary>
  /// Remove notification by ID
  /// </summary>
  remove(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  /// <summary>
  /// Clear all notifications
  /// </summary>
  clear(): void {
    this.toasts.set([]);
  }
}
