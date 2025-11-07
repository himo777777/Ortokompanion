/**
 * Logger Utility
 *
 * Centralized logging system that:
 * - Only logs in development
 * - Sends errors to error tracking in production
 * - Provides consistent log formatting
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  /**
   * Log informational messages (development only)
   */
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '')
    }
  }

  /**
   * Log warnings (always logged)
   */
  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context || '')
  }

  /**
   * Log errors (always logged, sent to error tracking in production)
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    console.error(`[ERROR] ${message}`, error, context || '')

    // In production, send to error tracking service (e.g., Sentry)
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // TODO: Integrate with Sentry or similar service
      // Sentry.captureException(error, { tags: context })
    }
  }

  /**
   * Debug logs (development only)
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '')
    }
  }

  /**
   * Log API requests (development only)
   */
  api(method: string, url: string, status: number, duration?: number) {
    if (this.isDevelopment) {
      const durationStr = duration ? ` (${duration}ms)` : ''
      console.log(`[API] ${method} ${url} - ${status}${durationStr}`)
    }
  }

  /**
   * Log database queries (development only)
   */
  db(query: string, duration?: number) {
    if (this.isDevelopment) {
      const durationStr = duration ? ` (${duration}ms)` : ''
      console.log(`[DB] ${query}${durationStr}`)
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export for testing
export { Logger }
