import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from '../../shared/services/logger.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Router } from '@angular/router';

/**
 * HTTP error interceptor
 * Handles all HTTP errors globally with appropriate user feedback
 */
export const errorHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Client Error: ${error.error.message}`;
        logger.error('HTTP Client Error', error.error);
      } else {
        // Server-side error
        errorMessage = getServerErrorMessage(error);
        logger.error(`HTTP ${error.status} Error`, {
          url: error.url,
          status: error.status,
          statusText: error.statusText,
          message: errorMessage,
          body: error.error
        });
      }

      // Handle specific status codes
      handleStatusCode(error.status, errorMessage, notificationService, router);

      // Re-throw the error so components can handle it if needed
      return throwError(() => error);
    })
  );
};

/**
 * Extract error message from server response
 */
function getServerErrorMessage(error: HttpErrorResponse): string {
  // Check for API error response format
  if (error.error?.message) {
    return error.error.message;
  }

  // Check for validation errors
  if (error.error?.errors && Array.isArray(error.error.errors)) {
    const messages = error.error.errors.map((e: any) => e.message || e).join(', ');
    return messages || 'Validation failed';
  }

  // Fallback to status text
  if (error.message) {
    return error.message;
  }

  return `Server Error ${error.status}: ${error.statusText}`;
}

/**
 * Handle specific HTTP status codes
 */
function handleStatusCode(
  status: number,
  message: string,
  notificationService: NotificationService,
  router: Router
): void {
  switch (status) {
    case 400:
      notificationService.warning('Invalid Request', message);
      break;
    case 401:
      // Don't show notification - auth interceptor handles this
      // Router navigation is handled by auth service
      break;
    case 403:
      notificationService.error('Forbidden', 'You do not have permission to access this resource');
      break;
    case 404:
      notificationService.warning('Not Found', 'The requested resource was not found');
      break;
    case 500:
      notificationService.error('Server Error', 'An internal server error occurred. Please try again later.');
      break;
    case 503:
      notificationService.error('Service Unavailable', 'The service is temporarily unavailable. Please try again later.');
      break;
    case 0:
      notificationService.error('Network Error', 'Unable to connect to the server. Please check your connection.');
      break;
    default:
      if (status >= 500) {
        notificationService.error('Server Error', message);
      } else if (status >= 400) {
        notificationService.warning('Error', message);
      }
  }
}