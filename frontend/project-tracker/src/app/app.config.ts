import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authHttpInterceptor } from './core/interceptors/auth.http-interceptor';
import { errorHttpInterceptor } from './core/interceptors/error.http-interceptor';
import { profilerInterceptor } from './core/interceptors/profiler.interceptor';

console.debug('App Config: Initializing application config...');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authHttpInterceptor, errorHttpInterceptor, profilerInterceptor]))
  ]
};

console.debug('App Config: HTTP interceptors configured (auth, error, profiler)');
