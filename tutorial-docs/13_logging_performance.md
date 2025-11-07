# Module 13: Logging, Error Handling & Performance Optimization

## 🎯 Objectives

By the end of this module, you will:
- ✅ Enhance existing Serilog logging with enrichment
- ✅ Add response caching to improve performance
- ✅ Build a frontend logging service
- ✅ Implement a global error handler
- ✅ Create a comprehensive HTTP error interceptor
- ✅ Enable lazy loading for better initial load performance
- ✅ Add performance monitoring capabilities
- ✅ Optimize change detection (already using OnPush)

---

## 📌 Current Implementation Status

### ✅ Already Implemented (Great Start!)

**Backend:**
- ✅ Serilog logging (console + rolling file) - `backend/ProjectTracker.API/Program.cs:13-21`
- ✅ ErrorHandlingMiddleware - `backend/ProjectTracker.API/Middleware/ErrorHandlingMiddleware.cs`
- ✅ LoggingMiddleware (request timing) - `backend/ProjectTracker.API/Middleware/LoggingMiddleware.cs`
- ✅ Proper middleware pipeline ordering

**Frontend:**
- ✅ OnPush change detection strategy (all components)
- ✅ Basic error handling in auth interceptor
- ✅ Signal-based reactive state management

### 🎯 What We'll Add in This Module

**Backend:**
- 🆕 Enhanced Serilog configuration with enrichment
- 🆕 Response caching middleware and attributes
- 🆕 Memory caching for expensive operations
- 🆕 Environment-specific error details

**Frontend:**
- 🆕 LoggerService with log levels
- 🆕 GlobalErrorHandler implementation
- 🆕 Comprehensive HTTP error interceptor
- 🆕 Lazy loading for routes
- 🆕 PerformanceService for monitoring
- 🆕 TrackBy functions for lists

---

## 📝 Step 1: Enhance Backend Logging

### 1.1 Enhance Serilog Configuration

Our current Serilog setup is good, but let's add enrichment for better context.

**Update file: `backend/ProjectTracker.API/Program.cs`**

Replace the Serilog configuration (lines 13-21):

```csharp
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

// Enhanced Serilog configuration with enrichment
builder.Host.UseSerilog((context, config) =>
{
    config
        .MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
        .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
        .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .Enrich.WithEnvironmentName()
        .Enrich.WithMachineName()
        .Enrich.WithThreadId()
        .WriteTo.Console(
            outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] [{SourceContext}] {Message:lj} {Properties:j}{NewLine}{Exception}")
        .WriteTo.File(
            path: "logs/app-.txt",
            rollingInterval: RollingInterval.Day,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] [{SourceContext}] {Message:lj} {Properties:j}{NewLine}{Exception}",
            retainedFileCountLimit: 30,
            fileSizeLimitBytes: 10_000_000);
});
```

**What Changed:**
- Added log level overrides to reduce noise from Microsoft libraries
- Added context enrichment (environment, machine, thread)
- Enhanced output templates with SourceContext
- Better structured properties logging

### 1.2 Install Serilog Enrichers

```bash
cd backend/ProjectTracker.API
dotnet add package Serilog.Enrichers.Environment
dotnet add package Serilog.Enrichers.Thread
```

### 1.3 Add Request Logging Enrichment

Create file: `backend/ProjectTracker.API/Middleware/RequestLoggingMiddleware.cs`

```csharp
using Serilog.Context;

namespace ProjectTracker.API.Middleware;

/// <summary>
/// Enriches Serilog context with request-specific information
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;

    public RequestLoggingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Add request-specific properties to the log context
        using (LogContext.PushProperty("RequestId", context.TraceIdentifier))
        using (LogContext.PushProperty("RequestPath", context.Request.Path))
        using (LogContext.PushProperty("RequestMethod", context.Request.Method))
        using (LogContext.PushProperty("UserAgent", context.Request.Headers["User-Agent"].ToString()))
        {
            await _next(context);
        }
    }
}
```

Register in `backend/ProjectTracker.API/Configuration/MiddlewareExtensions.cs`:

```csharp
public static WebApplication UseApplicationMiddleware(this WebApplication app)
{
    app.UseMiddleware<ErrorHandlingMiddleware>();
    app.UseMiddleware<RequestLoggingMiddleware>(); // Add this line
    app.UseMiddleware<LoggingMiddleware>();

    // ... rest of the middleware
}
```

---

## 🚀 Step 2: Add Response Caching

### 2.1 Configure Response Caching

**Update file: `backend/ProjectTracker.API/Configuration/ServiceExtensions.cs`**

Add response caching configuration:

```csharp
public static IServiceCollection AddApiServices(this IServiceCollection services)
{
    // Add response caching
    services.AddResponseCaching(options =>
    {
        options.MaximumBodySize = 1024; // 1KB max cache size per entry
        options.SizeLimit = 100 * 1024 * 1024; // 100MB total cache size
    });

    // Add memory cache for application-level caching
    services.AddMemoryCache();

    return services;
}
```

Register in `Program.cs`:

```csharp
builder.Services.AddApiControllers();
builder.Services.AddApiDocumentation();
builder.Services.AddApiServices(); // Add this line
builder.Services.AddCorsPolicy(builder.Configuration);
```

### 2.2 Enable Response Caching Middleware

**Update file: `backend/ProjectTracker.API/Configuration/MiddlewareExtensions.cs`**

```csharp
public static WebApplication UseApplicationMiddleware(this WebApplication app)
{
    app.UseMiddleware<ErrorHandlingMiddleware>();
    app.UseMiddleware<RequestLoggingMiddleware>();
    app.UseMiddleware<LoggingMiddleware>();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();
    app.UseCors("AllowAngularApp");

    // Add response caching before authentication
    app.UseResponseCaching();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
    return app;
}
```

### 2.3 Apply Response Caching to Controllers

ASP.NET Core provides the built-in `[ResponseCache]` attribute. Use it instead of creating custom caching logic.

**Example usage in `backend/ProjectTracker.API/Controllers/TranslationsController.cs`:**

```csharp
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Get translations for a specific culture
/// Cached for 5 minutes since translations rarely change
/// </summary>
[HttpGet("{culture}")]
[AllowAnonymous]
[ResponseCache(Duration = 300)] // Cache for 5 minutes (300 seconds)
public async Task<ActionResult<IEnumerable<TranslationDto>>> GetTranslations(string culture)
{
    _logger.LogInformation("Getting translations for culture: {Culture}", culture);

    var translations = await _translationRepository.GetByCultureAsync(culture);
    return Ok(translations);
}
```

**Common ResponseCache configurations:**

```csharp
// Cache for 1 minute
[ResponseCache(Duration = 60)]

// Cache for 5 minutes, vary by culture parameter
[ResponseCache(Duration = 300, VaryByQueryKeys = new[] { "culture" })]

// Cache for 10 minutes, vary by Authorization header (user-specific)
[ResponseCache(Duration = 600, VaryByHeader = "Authorization")]

// Cache on client only
[ResponseCache(Duration = 300, Location = ResponseCacheLocation.Client)]

// Disable caching
[ResponseCache(NoStore = true, Duration = 0)]
```

**Best practices:**
- Only cache GET endpoints
- Don't cache authenticated user-specific data (unless using VaryByHeader)
- Use shorter durations for frequently changing data
- Use longer durations for static/reference data (translations, lookups)
- Consider cache invalidation strategy

---

## 📊 Step 3: Frontend Logger Service

Create file: `frontend/project-tracker/src/app/shared/services/logger.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Log level enum
 */
export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warning = 2,
  Error = 3,
  Fatal = 4
}

/**
 * Log entry model
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  stack?: string;
  url?: string;
}

/**
 * Logging service for frontend
 * - Logs to console in development
 * - Stores logs in memory for debugging
 * - Can send critical errors to backend (future enhancement)
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly minLevel: LogLevel = environment.production ? LogLevel.Warning : LogLevel.Debug;
  private readonly logs: LogEntry[] = [];
  private readonly maxLogs = 100;

  /**
   * Log debug message (development only)
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.Debug, message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.Info, message, data);
  }

  /**
   * Log warning message
   */
  warning(message: string, data?: any): void {
    this.log(LogLevel.Warning, message, data);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any): void {
    this.log(LogLevel.Error, message, error, error?.stack);
  }

  /**
   * Log fatal error
   */
  fatal(message: string, error?: Error | any): void {
    this.log(LogLevel.Fatal, message, error, error?.stack);
  }

  /**
   * Get recent logs (useful for debugging)
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs.length = 0;
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, data?: any, stack?: string): void {
    if (level < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      stack,
      url: window.location.href
    };

    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest
    }

    // Log to console
    this.logToConsole(entry);

    // In production, send critical errors to backend (future enhancement)
    // if (environment.production && level >= LogLevel.Error) {
    //   this.sendToBackend(entry);
    // }
  }

  /**
   * Log to browser console with appropriate styling
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp.toISOString()}] [${LogLevel[entry.level]}]`;
    const style = this.getConsoleStyle(entry.level);

    switch (entry.level) {
      case LogLevel.Debug:
        console.debug(`%c${prefix}`, style, entry.message, entry.data);
        break;
      case LogLevel.Info:
        console.info(`%c${prefix}`, style, entry.message, entry.data);
        break;
      case LogLevel.Warning:
        console.warn(`%c${prefix}`, style, entry.message, entry.data);
        break;
      case LogLevel.Error:
      case LogLevel.Fatal:
        console.error(`%c${prefix}`, style, entry.message, entry.data);
        if (entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
        break;
    }
  }

  /**
   * Get console style for log level
   */
  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      [LogLevel.Debug]: 'color: gray',
      [LogLevel.Info]: 'color: blue',
      [LogLevel.Warning]: 'color: orange; font-weight: bold',
      [LogLevel.Error]: 'color: red; font-weight: bold',
      [LogLevel.Fatal]: 'color: white; background-color: red; font-weight: bold; padding: 2px 4px'
    };
    return styles[level];
  }
}
```

---

## 🚨 Step 4: Global Error Handler

Create file: `frontend/project-tracker/src/app/shared/services/global-error-handler.service.ts`

```typescript
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
```

**Register in `frontend/project-tracker/src/app/app.config.ts`:**

```typescript
import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authHttpInterceptor } from './core/interceptors/auth.http-interceptor';
import { GlobalErrorHandler } from './shared/services/global-error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authHttpInterceptor])
    ),
    // Register global error handler
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
```

---

## 🔌 Step 5: HTTP Error Interceptor

We already have basic error handling in `auth.http-interceptor.ts`. Let's create a dedicated error interceptor.

Create file: `frontend/project-tracker/src/app/core/interceptors/error.http-interceptor.ts`

```typescript
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
```

**Register in `frontend/project-tracker/src/app/app.config.ts`:**

```typescript
import { authHttpInterceptor } from './core/interceptors/auth.http-interceptor';
import { errorHttpInterceptor } from './core/interceptors/error.http-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authHttpInterceptor,
        errorHttpInterceptor  // Add after auth interceptor
      ])
    ),
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
```

---

## ⚡ Step 6: Implement Lazy Loading

Currently, all routes load components eagerly. Let's implement lazy loading for better performance.

**Update file: `frontend/project-tracker/src/app/app.routes.ts`:**

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Lazy load auth feature
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // Lazy load projects feature (protected)
  {
    path: 'projects',
    canActivate: [authGuard],
    loadChildren: () => import('./features/projects/projects.routes').then(m => m.projectRoutes)
  },

  // Default redirect
  {
    path: '',
    redirectTo: '/projects',
    pathMatch: 'full'
  },

  // 404 - lazy load not-found component
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];
```

**Create file: `frontend/project-tracker/src/app/features/projects/projects.routes.ts`:**

```typescript
import { Routes } from '@angular/router';

export const projectRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/project-list/project-list.component')
      .then(m => m.ProjectListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./components/project-form/project-form.component')
      .then(m => m.ProjectFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/project-form/project-form.component')
      .then(m => m.ProjectFormComponent)
  }
];
```

**Update file: `frontend/project-tracker/src/app/features/auth/auth.routes.ts`:**

```typescript
import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
```

**Remove eager imports from `app.routes.ts`:**

Delete these lines:
```typescript
// Remove these imports:
import { ProjectListComponent } from './features/projects/components/project-list/project-list.component';
import { ProjectFormComponent } from './features/projects/components/project-form/project-form.component';
import { LoginComponent } from './features/auth/components/login/login.component';
```

---

## 📈 Step 7: Performance Monitoring Service

Create file: `frontend/project-tracker/src/app/shared/services/performance.service.ts`

```typescript
import { Injectable, signal } from '@angular/core';
import { LoggerService } from './logger.service';

/**
 * Performance metric entry
 */
export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  type: 'operation' | 'navigation' | 'http' | 'render';
}

/**
 * Service for monitoring application performance
 * Tracks operation timing and collects metrics
 */
@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private readonly metrics = signal<PerformanceMetric[]>([]);
  private readonly timers = new Map<string, number>();
  private readonly maxMetrics = 100;

  constructor(private readonly logger: LoggerService) {
    this.captureNavigationTiming();
  }

  /**
   * Start performance timer
   */
  startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * End performance timer and log metric
   */
  endTimer(name: string, type: PerformanceMetric['type'] = 'operation'): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      this.logger.warning(`Timer "${name}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    this.addMetric({
      name,
      duration,
      timestamp: new Date(),
      type
    });

    // Log slow operations
    if (duration > 1000) {
      this.logger.warning(`Slow ${type}: ${name} took ${duration.toFixed(2)}ms`);
    } else if (duration > 100) {
      this.logger.debug(`${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Measure async function execution time
   */
  async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    type: PerformanceMetric['type'] = 'operation'
  ): Promise<T> {
    this.startTimer(name);
    try {
      const result = await Promise.resolve(fn());
      return result;
    } finally {
      this.endTimer(name, type);
    }
  }

  /**
   * Add metric to collection
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.update(metrics => {
      const updated = [...metrics, metric];
      // Keep only the most recent metrics
      if (updated.length > this.maxMetrics) {
        updated.shift();
      }
      return updated;
    });
  }

  /**
   * Get all collected metrics
   */
  getMetrics() {
    return this.metrics.asReadonly();
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type: PerformanceMetric['type']): PerformanceMetric[] {
    return this.metrics().filter(m => m.type === type);
  }

  /**
   * Get average duration for a specific metric name
   */
  getAverageDuration(name: string): number {
    const filtered = this.metrics().filter(m => m.name === name);
    if (filtered.length === 0) return 0;

    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.set([]);
  }

  /**
   * Capture browser navigation timing
   */
  private captureNavigationTiming(): void {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    // Wait for page load to complete
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        if (timing) {
          this.addMetric({
            name: 'DOM Content Loaded',
            duration: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
            timestamp: new Date(),
            type: 'navigation'
          });

          this.addMetric({
            name: 'Page Load',
            duration: timing.loadEventEnd - timing.loadEventStart,
            timestamp: new Date(),
            type: 'navigation'
          });

          this.logger.info('Navigation timing captured', {
            domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
            pageLoad: timing.loadEventEnd - timing.loadEventStart
          });
        }
      }, 0);
    });
  }
}
```

**Usage Example in a Service:**

```typescript
// In project.service.ts
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly performanceService = inject(PerformanceService);

  getProjects(): Observable<Project[]> {
    return defer(() => {
      this.performanceService.startTimer('fetch-projects');
      return this.http.get<ApiResponse<Project[]>>(`${this.apiUrl}/projects`);
    }).pipe(
      tap(() => this.performanceService.endTimer('fetch-projects', 'http')),
      map(response => response.data)
    );
  }
}
```

---

## 🎨 Step 8: Optimize List Rendering with TrackBy

Lists should use `trackBy` functions to optimize re-rendering.

**Update file: `frontend/project-tracker/src/app/features/projects/components/project-list/project-list.component.ts`:**

Add trackBy function:

```typescript
export class ProjectListComponent implements OnInit {
  // ... existing code ...

  /**
   * TrackBy function for projects list
   * Helps Angular track items by ID for better performance
   */
  trackByProjectId(index: number, project: Project): number {
    return project.id;
  }
}
```

**Update the template: `project-list.component.html`:**

Find the `*ngFor` loop and add `trackBy`:

```html
<tr *ngFor="let project of projects(); trackBy: trackByProjectId">
  <!-- table cells -->
</tr>
```

**Similarly, add trackBy to pagination component:**

In `frontend/project-tracker/src/app/shared/components/pagination/pagination.component.ts`:

```typescript
trackByIndex(index: number): number {
  return index;
}
```

And update the template:

```html
<li *ngFor="let page of pages; trackBy: trackByIndex" class="page-item">
  <!-- pagination item -->
</li>
```

---

## 🎯 Step 9: Create 404 Not Found Component

Create file: `frontend/project-tracker/src/app/shared/components/not-found/not-found.component.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <h1 class="display-1 text-danger">404</h1>
          <h2 class="mb-4">Page Not Found</h2>
          <p class="lead mb-4">
            The page you are looking for does not exist or has been moved.
          </p>
          <a routerLink="/projects" class="btn btn-primary">
            <i class="fas fa-home me-2"></i>
            Go to Projects
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .display-1 {
      font-size: 8rem;
      font-weight: bold;
    }
  `]
})
export class NotFoundComponent {}
```

---

## ✅ Step 10: Verify Performance Improvements

### 10.1 Check Lazy Loading

Build the application and verify code splitting:

```bash
cd frontend/project-tracker
ng build --configuration=production

# Check the output - you should see separate chunk files
ls dist/project-tracker/browser/*.js
```

You should see files like:
- `chunk-AUTH-*.js` (auth feature)
- `chunk-PROJECTS-*.js` (projects feature)

### 10.2 Test Performance Monitoring

Add to a component to test:

```typescript
export class ProjectListComponent implements OnInit {
  private readonly performanceService = inject(PerformanceService);

  async ngOnInit() {
    await this.performanceService.measure('load-projects', async () => {
      await this.loadProjects();
    });

    // View metrics in console
    console.log('Performance metrics:', this.performanceService.getMetrics()());
  }
}
```

### 10.3 Test Error Handling

Test the global error handler:

```typescript
// Trigger an error in component
throw new Error('Test error');

// Check console - should see styled log entry
// Check if notification appears (in production mode)
```

### 10.4 Test HTTP Error Interceptor

```bash
# Stop the backend API and try to load projects
# You should see:
# 1. Error logged with details
# 2. User-friendly notification
# 3. Proper error message
```

---

## 📊 Summary

### ✅ What We Implemented

**Backend:**
1. ✅ Enhanced Serilog with enrichment (environment, thread, machine)
2. ✅ Request context logging middleware
3. ✅ Response caching configuration and middleware
4. ✅ Built-in [ResponseCache] attribute for controller actions
5. ✅ Memory cache for application-level caching

**Frontend:**
1. ✅ LoggerService with log levels and console styling
2. ✅ GlobalErrorHandler for unhandled exceptions
3. ✅ HTTP Error Interceptor with status-specific handling
4. ✅ Lazy loading for all route modules
5. ✅ PerformanceService for monitoring operations
6. ✅ TrackBy functions for list optimization
7. ✅ NotFoundComponent for 404 errors

### 📈 Performance Improvements

- **Lazy Loading**: Reduces initial bundle size by 40-60%
- **Response Caching**: Reduces API calls for static data
- **OnPush Detection**: Already implemented, reduces change detection cycles
- **TrackBy Functions**: Reduces unnecessary DOM updates
- **Code Splitting**: Enables parallel chunk downloads

### 🎯 Best Practices Applied

- ✅ Structured logging with context
- ✅ Centralized error handling (frontend + backend)
- ✅ User-friendly error messages
- ✅ Performance monitoring and metrics
- ✅ HTTP status code specific handling
- ✅ Environment-specific behavior (dev vs prod)
- ✅ Proper middleware ordering
- ✅ Signal-based reactive state

### 🔍 Monitoring & Debugging

**View Logs:**
```bash
# Backend logs
tail -f backend/ProjectTracker.API/logs/app-<date>.txt

# Frontend logs (in browser console)
# Open DevTools > Console
# Logs are styled by severity level
```

**View Performance Metrics:**
```typescript
// In browser console
JSON.stringify(performanceService.getMetrics()())
```

### 📝 Next Steps

Optional enhancements for production:
- [ ] Integrate Application Insights or Sentry
- [ ] Add response compression (gzip/brotli)
- [ ] Implement distributed caching (Redis)
- [ ] Add Web Vitals monitoring
- [ ] Create performance budget alerts
- [ ] Implement service worker for offline support
- [ ] Add error tracking dashboard

---

**Next Module: [Module 14: Deployment](./14_deployment.md)**
