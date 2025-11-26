import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../../shared/services/logger.service';
import { catchError, throwError } from 'rxjs';

/**
 * HTTP Interceptor function for adding JWT token to requests
 * This is the modern Angular 14+ approach for standalone components
 */
export const authHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const logger = inject(LoggerService);
  const token = authService.getToken();

  logger.debug('authHttpInterceptor: Intercepting request', { url: req.url, hasToken: !!token });

  // Don't add token to public endpoints (translations, auth)
  const isPublicEndpoint = req.url.includes('/auth/') || req.url.includes('/translations/');
  
  if (token && !isPublicEndpoint) {
    logger.debug('authHttpInterceptor: Adding Bearer token to request', { url: req.url });
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    logger.debug('authHttpInterceptor: Authorization header set', { 
      authHeader: req.headers.get('Authorization')?.substring(0, 30) + '...' 
    });
  } else {
    logger.debug('authHttpInterceptor: Skipping token add', { 
      url: req.url, 
      hasToken: !!token,
      isPublicEndpoint: isPublicEndpoint
    });
    // Set Accept header for all requests
    req = req.clone({
      setHeaders: {
        'Accept': 'application/json'
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      logger.error('authHttpInterceptor: HTTP Error', { status: error.status, url: error.url, message: error.message });
      
      if (error.status === 401) {
        // Token might be expired, clear it
        logger.warning('authHttpInterceptor: 401 received, clearing token');
        authService.logout();
      }
      
      return throwError(() => error);
    })
  );
};
