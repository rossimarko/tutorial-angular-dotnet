import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggerService } from './logger.service';
import { NotificationService } from './notification.service';
import { environment } from '../../../environments/environment';

/**
 * Global error handler for Angular application
 * Catches all unhandled errors and exceptions
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);

  handleError(error: Error | any): void {
    // Log the error with full details
    this.logger.error('Unhandled error occurred', error);

    // Extract user-friendly message
    const message = this.getUserFriendlyMessage(error);

    // Show notification to user (production only - avoid noise in dev)
    if (environment.production) {
      this.notificationService.error('Error', message);
    }

    // In development, also log to console for debugging
    if (!environment.production) {
      console.error('🔴 GlobalErrorHandler:', error);
    }
  }

  /**
   * Extract user-friendly error message
   */
  private getUserFriendlyMessage(error: any): string {
    // HTTP errors are handled by interceptor
    if (error?.status) {
      return 'A network error occurred. Please try again.';
    }

    // Angular errors
    if (error?.rejection) {
      return 'An application error occurred. Please refresh the page.';
    }

    // Custom error messages
    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'An unexpected error occurred. Please try again.';
  }
}