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