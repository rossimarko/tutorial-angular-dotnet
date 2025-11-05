import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);

  constructor() {
    console.log('AuthInterceptor: Interceptor instantiated');
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('AuthInterceptor.intercept: Called for URL', request.url);
    
    const token = this.authService.getToken();
    console.log('AuthInterceptor.intercept: Token retrieved', { hasToken: !!token });

    // Add token to request if it exists and it's not an auth endpoint
    if (token && !request.url.includes('/auth/')) {
      console.log('AuthInterceptor.intercept: Adding Bearer token to request', { 
        url: request.url, 
        tokenLength: token.length 
      });
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('AuthInterceptor.intercept: Request cloned with Authorization header', {
        authHeader: request.headers.get('Authorization')?.substring(0, 30) + '...'
      });
    } else {
      console.log('AuthInterceptor.intercept: Skipping token add', { 
        url: request.url, 
        hasToken: !!token,
        isAuthEndpoint: request.url.includes('/auth/')
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('AuthInterceptor: HTTP Error', { status: error.status, url: error.url });
        if (error.status === 401) {
          // Token might be expired, clear it
          console.warn('AuthInterceptor: 401 received, clearing token');
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
