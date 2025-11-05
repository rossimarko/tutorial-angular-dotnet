import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

/**
 * HTTP Interceptor function for adding JWT token to requests
 * This is the modern Angular 14+ approach for standalone components
 */
export const authHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('authHttpInterceptor: Intercepting request', { url: req.url, hasToken: !!token });

  // Add token to request if it exists and it's not an auth endpoint
  if (token && !req.url.includes('/auth/')) {
    console.log('authHttpInterceptor: Adding Bearer token to request', { url: req.url });
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('authHttpInterceptor: Authorization header set:', { 
      authHeader: req.headers.get('Authorization')?.substring(0, 30) + '...' 
    });
  } else {
    console.log('authHttpInterceptor: Skipping token add', { 
      url: req.url, 
      hasToken: !!token,
      isAuthEndpoint: req.url.includes('/auth/')
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('authHttpInterceptor: HTTP Error', { status: error.status, url: error.url, message: error.message });
      
      if (error.status === 401) {
        // Token might be expired, clear it
        console.warn('authHttpInterceptor: 401 received, clearing token');
        authService.logout();
      }
      
      return throwError(() => error);
    })
  );
};
