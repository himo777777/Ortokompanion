/**
 * Application Logger
 *
 * Provides environment-aware logging that:
 * - Only logs in development mode by default
 * - Can be controlled via ENABLE_DETAILED_LOGS env var
 * - Provides different log levels (debug, info, warn, error)
 * - Easy to integrate with external services (Sentry, etc.) later
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;
  private detailedLogsEnabled: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.detailedLogsEnabled = process.env.ENABLE_DETAILED_LOGS === 'true';
  }

  /**
   * Check if logging should be enabled for this level
   */
  private shouldLog(level: LogLevel): boolean {
    // Always log errors and warnings
    if (level === 'error' || level === 'warn') {
      return true;
    }

    // Log info and debug only in development or when detailed logs enabled
    return this.isDevelopment || this.detailedLogsEnabled;
  }

  /**
   * Format log message with context
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(context)}`;
    }

    return `${prefix} ${message}`;
  }

  /**
   * Send to external monitoring service (placeholder for future integration)
   */
  private sendToMonitoring(level: LogLevel, message: string, context?: LogContext): void {
    // TODO: Integrate with Sentry or other monitoring service
    // if (level === 'error') {
    //   Sentry.captureException(new Error(message), { extra: context });
    // }
  }

  /**
   * Debug level logging (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;

    const formatted = this.formatMessage('debug', message, context);
    console.debug(formatted);
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;

    const formatted = this.formatMessage('info', message, context);
    console.info(formatted);
  }

  /**
   * Warning level logging (always logged)
   */
  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('warn', message, context);
    console.warn(formatted);
    this.sendToMonitoring('warn', message, context);
  }

  /**
   * Error level logging (always logged)
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const formatted = this.formatMessage('error', message, context);

    if (error instanceof Error) {
      console.error(formatted, error);
      this.sendToMonitoring('error', `${message}: ${error.message}`, {
        ...context,
        stack: error.stack,
      });
    } else {
      console.error(formatted, error);
      this.sendToMonitoring('error', message, context);
    }
  }

  /**
   * Performance timing helper
   */
  time(label: string): void {
    if (this.shouldLog('debug')) {
      console.time(label);
    }
  }

  /**
   * End performance timing
   */
  timeEnd(label: string): void {
    if (this.shouldLog('debug')) {
      console.timeEnd(label);
    }
  }

  /**
   * Group logs together (development only)
   */
  group(label: string): void {
    if (this.shouldLog('debug')) {
      console.group(label);
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (this.shouldLog('debug')) {
      console.groupEnd();
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing/advanced usage
export { Logger };
