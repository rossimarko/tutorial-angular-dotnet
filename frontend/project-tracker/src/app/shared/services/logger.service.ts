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