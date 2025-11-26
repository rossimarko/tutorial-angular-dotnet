import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { tap } from 'rxjs';

/**
 * HTTP Interceptor for MiniProfiler integration.
 * Reads Server-Timing header from API responses and logs profiling data to console.
 * Only active in development mode.
 */
export const profilerInterceptor: HttpInterceptorFn = (req, next) => {
  // Only profile in development mode
  if (!isDevMode()) {
    return next(req);
  }

  const startTime = performance.now();

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);

        // Read Server-Timing header from MiniProfiler
        const serverTiming = event.headers.get('Server-Timing');

        if (serverTiming) {
          // Parse Server-Timing header (format: "total;dur=123.45")
          const timingMatch = serverTiming.match(/dur=(\d+\.?\d*)/);
          const serverDuration = timingMatch ? timingMatch[1] : 'N/A';

          console.debug(
            `%c[MiniProfiler] %c${req.method} %c${req.url}`,
            'color: #9c27b0; font-weight: bold',
            'color: #2196f3',
            'color: #4caf50',
            {
              clientDuration: `${duration}ms`,
              serverDuration: `${serverDuration}ms`,
              status: event.status,
              serverTiming
            }
          );
        } else {
          // Log even without Server-Timing for visibility
          console.debug(
            `%c[Profiler] %c${req.method} %c${req.url}`,
            'color: #607d8b; font-weight: bold',
            'color: #2196f3',
            'color: #4caf50',
            {
              clientDuration: `${duration}ms`,
              status: event.status
            }
          );
        }
      }
    })
  );
};
