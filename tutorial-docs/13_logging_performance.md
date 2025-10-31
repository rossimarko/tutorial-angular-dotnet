# Module 13: Logging, Error Handling & Performance Optimization# Module 13: Logging, Error Handling & Performance



## 🎯 Objectives## 🎯 Objectives



By the end of this module, you will:- ✅ Structured logging

- ✅ Implement structured logging with Serilog (.NET)- ✅ Global error handling

- ✅ Create a frontend logging service- ✅ HTTP interceptors

- ✅ Build global error handling middleware- ✅ Caching strategies

- ✅ Implement HTTP error interceptor- ✅ Performance optimization

- ✅ Add response caching strategies

- ✅ Optimize Angular change detection## 📌 Status: Framework Ready

- ✅ Implement lazy loading and code splitting

- ✅ Monitor performance metricsImplement:

- ✅ Add request/response logging

### Logging

## 📋 What is Logging & Performance Optimization?- [ ] Backend: Serilog configuration

- [ ] Frontend: Logger service

**Logging** helps you:- [ ] Request/response logging

- Debug production issues

- Monitor application health### Error Handling

- Track user behavior- [ ] Global error handler middleware

- Audit security events- [ ] HTTP error interceptor

- Analyze performance bottlenecks- [ ] User-friendly error messages



**Performance Optimization** ensures:### Performance

- Fast page loads- [ ] Response caching

- Smooth user interactions- [ ] Request debouncing

- Efficient resource usage- [ ] Lazy loading

- Better SEO rankings- [ ] Code splitting

- Lower server costs- [ ] Change detection optimization



------



## 📝 Step 1: Backend Structured Logging with Serilog**Next: [Module 14: Deployment](./14_deployment.md)**


Install Serilog packages:

```bash
cd backend/ProjectTracker.API
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.File
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Enrichers.Environment
dotnet add package Serilog.Enrichers.Thread
```

Update file: `backend/ProjectTracker.API/Program.cs`

```csharp
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
    .Enrich.FromLogContext()
    .Enrich.WithEnvironmentName()
    .Enrich.WithMachineName()
    .Enrich.WithThreadId()
    .WriteTo.Console(
        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .WriteTo.File(
        path: "logs/app-.txt",
        rollingInterval: RollingInterval.Day,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}",
        retainedFileCountLimit: 30,
        fileSizeLimitBytes: 10_000_000)
    .CreateLogger();

try
{
    Log.Information("Starting ProjectTracker API");

    // Use Serilog for request logging
    builder.Host.UseSerilog();

    // ... existing service configuration ...

    var app = builder.Build();

    // Add request logging
    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
        options.GetLevel = (httpContext, elapsed, ex) => ex != null
            ? LogEventLevel.Error
            : httpContext.Response.StatusCode > 499
                ? LogEventLevel.Error
                : LogEventLevel.Information;
        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
            diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
            diagnosticContext.Set("UserAgent", httpContext.Request.Headers["User-Agent"].ToString());
        };
    });

    // ... existing middleware configuration ...

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
```

Create file: `backend/ProjectTracker.API/Services/LoggingService.cs`

```csharp
namespace ProjectTracker.API.Services;

/// <summary>
/// Service for structured logging with context
/// </summary>
public interface ILoggingService
{
    void LogInformation(string message, params object[] args);
    void LogWarning(string message, params object[] args);
    void LogError(Exception exception, string message, params object[] args);
    void LogDebug(string message, params object[] args);
}

/// <summary>
/// Implementation of logging service
/// </summary>
public class LoggingService : ILoggingService
{
    private readonly ILogger<LoggingService> _logger;

    public LoggingService(ILogger<LoggingService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Log information message
    /// </summary>
    public void LogInformation(string message, params object[] args)
    {
        _logger.LogInformation(message, args);
    }

    /// <summary>
    /// Log warning message
    /// </summary>
    public void LogWarning(string message, params object[] args)
    {
        _logger.LogWarning(message, args);
    }

    /// <summary>
    /// Log error with exception
    /// </summary>
    public void LogError(Exception exception, string message, params object[] args)
    {
        _logger.LogError(exception, message, args);
    }

    /// <summary>
    /// Log debug message
    /// </summary>
    public void LogDebug(string message, params object[] args)
    {
        _logger.LogDebug(message, args);
    }
}
```

---

## 🔧 Step 2: Enhanced Error Handling Middleware

Update file: `backend/ProjectTracker.API/Middleware/ErrorHandlingMiddleware.cs`

```csharp
using System.Net;
using System.Text.Json;
using ProjectTracker.API.Models.Common;

namespace ProjectTracker.API.Middleware;

/// <summary>
/// Global error handling middleware with logging
/// </summary>
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    public ErrorHandlingMiddleware(
        RequestDelegate next,
        ILogger<ErrorHandlingMiddleware> logger,
        IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = new ErrorResponse
        {
            Success = false,
            Message = GetUserFriendlyMessage(exception),
            Timestamp = DateTime.UtcNow
        };

        // Add stack trace in development
        if (_env.IsDevelopment())
        {
            response.Details = exception.StackTrace;
            response.InnerException = exception.InnerException?.Message;
        }

        context.Response.StatusCode = exception switch
        {
            ArgumentNullException => (int)HttpStatusCode.BadRequest,
            ArgumentException => (int)HttpStatusCode.BadRequest,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            InvalidOperationException => (int)HttpStatusCode.Conflict,
            _ => (int)HttpStatusCode.InternalServerError
        };

        response.StatusCode = context.Response.StatusCode;

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(response, options);
        await context.Response.WriteAsync(json);
    }

    private static string GetUserFriendlyMessage(Exception exception)
    {
        return exception switch
        {
            ArgumentNullException => "A required value was not provided.",
            ArgumentException => "Invalid argument provided.",
            UnauthorizedAccessException => "You are not authorized to perform this action.",
            KeyNotFoundException => "The requested resource was not found.",
            InvalidOperationException => "The operation could not be completed.",
            _ => "An unexpected error occurred. Please try again later."
        };
    }
}

/// <summary>
/// Error response model
/// </summary>
public class ErrorResponse
{
    public required bool Success { get; init; }
    public required string Message { get; init; }
    public required int StatusCode { get; set; }
    public required DateTime Timestamp { get; init; }
    public string? Details { get; set; }
    public string? InnerException { get; set; }
}
```

---

## 🎯 Step 3: Response Caching

Update file: `backend/ProjectTracker.API/Program.cs`

Add response caching:

```csharp
// Add response caching
builder.Services.AddResponseCaching();
builder.Services.AddMemoryCache();

// Configure in the middleware pipeline
app.UseResponseCaching();
```

Create file: `backend/ProjectTracker.API/Attributes/CacheAttribute.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace ProjectTracker.API.Attributes;

/// <summary>
/// Attribute to enable response caching on controller actions
/// </summary>
[AttributeUsage(AttributeTargets.Method)]
public class CacheAttribute : Attribute, IActionFilter
{
    private readonly int _durationInSeconds;

    public CacheAttribute(int durationInSeconds = 60)
    {
        _durationInSeconds = durationInSeconds;
    }

    public void OnActionExecuting(ActionExecutingContext context)
    {
        // Nothing to do before action executes
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        if (context.Result is OkObjectResult)
        {
            context.HttpContext.Response.Headers["Cache-Control"] = 
                $"public, max-age={_durationInSeconds}";
        }
    }
}
```

Usage example in controller:

```csharp
/// <summary>
/// Get all projects (cached for 60 seconds)
/// </summary>
[HttpGet]
[Cache(60)]
public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
{
    // ... implementation
}
```

---

## 📊 Step 4: Frontend Logging Service

Create file: `frontend/project-tracker/src/app/shared/services/logger.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/// <summary>
/// Log level enum
/// </summary>
export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warning = 2,
  Error = 3,
  Fatal = 4
}

/// <summary>
/// Log entry model
/// </summary>
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  stack?: string;
}

/// <summary>
/// Logging service for frontend
/// Logs to console in development, can send to backend in production
/// </summary>
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly minLevel: LogLevel = environment.production ? LogLevel.Warning : LogLevel.Debug;
  private readonly logs: LogEntry[] = [];
  private readonly maxLogs = 100;

  /// <summary>
  /// Log debug message
  /// </summary>
  debug(message: string, data?: any): void {
    this.log(LogLevel.Debug, message, data);
  }

  /// <summary>
  /// Log info message
  /// </summary>
  info(message: string, data?: any): void {
    this.log(LogLevel.Info, message, data);
  }

  /// <summary>
  /// Log warning message
  /// </summary>
  warning(message: string, data?: any): void {
    this.log(LogLevel.Warning, message, data);
  }

  /// <summary>
  /// Log error message
  /// </summary>
  error(message: string, error?: Error | any): void {
    this.log(LogLevel.Error, message, error, error?.stack);
  }

  /// <summary>
  /// Log fatal error
  /// </summary>
  fatal(message: string, error?: Error | any): void {
    this.log(LogLevel.Fatal, message, error, error?.stack);
  }

  /// <summary>
  /// Get recent logs
  /// </summary>
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /// <summary>
  /// Clear all logs
  /// </summary>
  clearLogs(): void {
    this.logs.length = 0;
  }

  /// <summary>
  /// Internal log method
  /// </summary>
  private log(level: LogLevel, message: string, data?: any, stack?: string): void {
    if (level < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      stack
    };

    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest
    }

    // Log to console
    this.logToConsole(entry);

    // In production, send critical errors to backend
    if (environment.production && level >= LogLevel.Error) {
      this.sendToBackend(entry);
    }
  }

  /// <summary>
  /// Log to browser console
  /// </summary>
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
          console.error(entry.stack);
        }
        break;
    }
  }

  /// <summary>
  /// Get console style for log level
  /// </summary>
  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      [LogLevel.Debug]: 'color: gray',
      [LogLevel.Info]: 'color: blue',
      [LogLevel.Warning]: 'color: orange',
      [LogLevel.Error]: 'color: red; font-weight: bold',
      [LogLevel.Fatal]: 'color: white; background-color: red; font-weight: bold'
    };
    return styles[level];
  }

  /// <summary>
  /// Send log to backend (production only)
  /// </summary>
  private sendToBackend(entry: LogEntry): void {
    // TODO: Implement API call to send logs to backend
    // Example: POST /api/logs
    try {
      fetch(`${environment.apiUrl}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      }).catch(err => console.error('Failed to send log to backend:', err));
    } catch (error) {
      console.error('Error sending log to backend:', error);
    }
  }
}
```

---

## 🚨 Step 5: Global Error Handler

Create file: `frontend/project-tracker/src/app/shared/services/global-error-handler.service.ts`

```typescript
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggerService } from './logger.service';
import { NotificationService } from './notification.service';

/// <summary>
/// Global error handler for Angular application
/// Catches all unhandled errors
/// </summary>
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);

  handleError(error: Error | any): void {
    // Log the error
    this.logger.error('Unhandled error occurred', error);

    // Extract user-friendly message
    const message = this.getUserFriendlyMessage(error);

    // Show notification to user
    this.notificationService.error('Error', message);

    // Rethrow in development for debugging
    if (!this.isProduction()) {
      console.error('GlobalErrorHandler:', error);
    }
  }

  /// <summary>
  /// Get user-friendly error message
  /// </summary>
  private getUserFriendlyMessage(error: any): string {
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

  /// <summary>
  /// Check if running in production
  /// </summary>
  private isProduction(): boolean {
    return false; // Replace with environment.production
  }
}
```

Register in `app.config.ts`:

```typescript
import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from './shared/services/global-error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
```

---

## 🔌 Step 6: HTTP Error Interceptor

Create file: `frontend/project-tracker/src/app/shared/interceptors/error.interceptor.ts`

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from '../services/logger.service';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

/// <summary>
/// HTTP error interceptor
/// Handles HTTP errors globally
/// </summary>
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
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
        logger.error(`HTTP Error ${error.status}`, {
          url: error.url,
          status: error.status,
          message: errorMessage
        });
      }

      // Handle specific status codes
      switch (error.status) {
        case 401:
          notificationService.warning('Unauthorized', 'Please log in to continue');
          router.navigate(['/auth/login']);
          break;
        case 403:
          notificationService.error('Forbidden', 'You do not have permission to access this resource');
          break;
        case 404:
          notificationService.warning('Not Found', 'The requested resource was not found');
          break;
        case 500:
          notificationService.error('Server Error', 'An internal server error occurred');
          break;
        case 0:
          notificationService.error('Network Error', 'Unable to connect to the server');
          break;
        default:
          notificationService.error('Error', errorMessage);
      }

      return throwError(() => error);
    })
  );
};

/// <summary>
/// Extract error message from server response
/// </summary>
function getServerErrorMessage(error: HttpErrorResponse): string {
  if (error.error?.message) {
    return error.error.message;
  }

  if (error.message) {
    return error.message;
  }

  return `Server Error ${error.status}: ${error.statusText}`;
}
```

Register in `app.config.ts`:

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './shared/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([errorInterceptor])
    )
  ]
};
```

---

## ⚡ Step 7: Performance Optimization - Lazy Loading

Update your routing to implement lazy loading:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'projects',
    loadChildren: () => import('./features/projects/projects.routes').then(m => m.PROJECT_ROUTES)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
```

Create feature route files:

```typescript
// auth.routes.ts
import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  }
];

// projects.routes.ts
import { Routes } from '@angular/router';

export const PROJECT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/project-list/project-list.component').then(m => m.ProjectListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./components/project-form/project-form.component').then(m => m.ProjectFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/project-form/project-form.component').then(m => m.ProjectFormComponent)
  }
];
```

---

## 🎨 Step 8: Change Detection Optimization

Create file: `frontend/project-tracker/src/app/shared/directives/performance-monitor.directive.ts`

```typescript
import { Directive, ElementRef, inject, OnInit, OnDestroy } from '@angular/core';
import { LoggerService } from '../services/logger.service';

/// <summary>
/// Directive to monitor component render performance
/// </summary>
@Directive({
  selector: '[appPerformanceMonitor]'
})
export class PerformanceMonitorDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly logger = inject(LoggerService);
  private startTime: number = 0;

  ngOnInit(): void {
    this.startTime = performance.now();
  }

  ngOnDestroy(): void {
    const duration = performance.now() - this.startTime;
    const componentName = this.el.nativeElement.tagName.toLowerCase();
    
    if (duration > 100) {
      this.logger.warning(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
    } else {
      this.logger.debug(`${componentName} rendered in ${duration.toFixed(2)}ms`);
    }
  }
}
```

---

## 📈 Step 9: Performance Monitoring Service

Create file: `frontend/project-tracker/src/app/shared/services/performance.service.ts`

```typescript
import { Injectable, signal } from '@angular/core';
import { LoggerService } from './logger.service';

/// <summary>
/// Performance metric
/// </summary>
export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
}

/// <summary>
/// Service for monitoring application performance
/// </summary>
@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private readonly metrics = signal<PerformanceMetric[]>([]);
  private readonly timers = new Map<string, number>();

  constructor(private readonly logger: LoggerService) {}

  /// <summary>
  /// Start performance timer
  /// </summary>
  startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  /// <summary>
  /// End performance timer and log metric
  /// </summary>
  endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      this.logger.warning(`Timer "${name}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date()
    };

    this.metrics.update(metrics => [...metrics, metric]);

    if (duration > 1000) {
      this.logger.warning(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    } else {
      this.logger.debug(`${name} completed in ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /// <summary>
  /// Get all metrics
  /// </summary>
  getMetrics() {
    return this.metrics.asReadonly();
  }

  /// <summary>
  /// Clear all metrics
  /// </summary>
  clearMetrics(): void {
    this.metrics.set([]);
  }

  /// <summary>
  /// Measure function execution time
  /// </summary>
  async measure<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
    this.startTimer(name);
    try {
      const result = await Promise.resolve(fn());
      return result;
    } finally {
      this.endTimer(name);
    }
  }
}
```

Usage example:

```typescript
// In a component or service
export class ProjectService {
  private readonly performanceService = inject(PerformanceService);

  async loadProjects(): Promise<void> {
    await this.performanceService.measure('loadProjects', async () => {
      // Your async operation here
      const projects = await this.http.get<Project[]>(this.apiUrl).toPromise();
      this.projects.set(projects);
    });
  }
}
```

---

## ✅ Summary

### **What We Built:**

1. ✅ **Backend Logging (Serilog)**
   - Structured logging to console and file
   - Request/response logging
   - Log enrichment (environment, machine, thread)
   - Rolling file logs with retention
   - Custom logging service

2. ✅ **Enhanced Error Handling**
   - Global error middleware
   - User-friendly error messages
   - Stack trace in development only
   - HTTP status code mapping
   - Structured error responses

3. ✅ **Response Caching**
   - In-memory caching
   - Cache attribute for controllers
   - Configurable cache duration
   - Cache-Control headers

4. ✅ **Frontend Logging Service**
   - Log levels (Debug, Info, Warning, Error, Fatal)
   - Console logging with colors
   - In-memory log storage
   - Send errors to backend in production
   - Log history

5. ✅ **Global Error Handling**
   - Angular ErrorHandler implementation
   - User notifications for errors
   - Automatic error logging
   - Production vs development behavior

6. ✅ **HTTP Error Interceptor**
   - Centralized HTTP error handling
   - Status code specific handling
   - Automatic redirect on 401
   - User-friendly error notifications

7. ✅ **Performance Optimization**
   - Lazy loading modules
   - Code splitting by route
   - Performance monitoring service
   - Render time tracking directive
   - Timer utilities

### **Best Practices Applied:**
- ✅ Structured logging with context
- ✅ Centralized error handling
- ✅ User-friendly error messages
- ✅ Performance monitoring
- ✅ Lazy loading for faster initial load
- ✅ OnPush change detection (already implemented)
- ✅ Signal-based reactivity
- ✅ Response caching for read operations

### **Performance Improvements:**
- Lazy loading reduces initial bundle size by 40-60%
- Response caching reduces API calls
- OnPush detection reduces change detection cycles
- Code splitting enables parallel downloads

### **Production Checklist:**
- [ ] Enable response compression (gzip/brotli)
- [ ] Configure CDN for static assets
- [ ] Set up monitoring (Application Insights, Sentry)
- [ ] Enable production builds with AOT
- [ ] Configure log aggregation (ELK, Splunk)
- [ ] Set up performance budgets
- [ ] Enable service workers for PWA

---

**Next: [Module 14: Deployment](./14_deployment.md)**
