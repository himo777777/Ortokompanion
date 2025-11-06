/**
 * Centralized Error Handling Utilities
 *
 * Provides consistent error handling, logging, and user feedback across the application.
 * This reduces code duplication and makes it easier to add features like Sentry integration.
 */

export interface ErrorHandlerOptions {
  /** Name of the operation being performed (e.g., 'loadProfile', 'generateStudyPlan') */
  operation: string;
  /** Value to return if an error occurs */
  fallbackValue?: any;
  /** Whether to show a toast notification to the user */
  showToast?: boolean;
  /** Whether to log to external service (Sentry/LogRocket) in production */
  logToService?: boolean;
  /** Additional context to include in error logs */
  context?: Record<string, unknown>;
}

/**
 * Handles async errors with consistent logging and optional user feedback
 *
 * @param fn - Async function to execute
 * @param options - Error handling configuration
 * @returns Result of fn() on success, fallbackValue (or null) on error
 *
 * @example
 * ```typescript
 * const profile = await handleError(
 *   async () => {
 *     const data = await fetchUserProfile();
 *     return parseProfile(data);
 *   },
 *   {
 *     operation: 'loadUserProfile',
 *     fallbackValue: null,
 *     showToast: true,
 *     context: { userId: '123' }
 *   }
 * );
 * ```
 */
export async function handleError<T>(
  fn: () => Promise<T>,
  options: ErrorHandlerOptions
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    logError(error, options);
    return (options.fallbackValue ?? null) as T | null;
  }
}

/**
 * Handles synchronous errors with consistent logging
 *
 * @param fn - Synchronous function to execute
 * @param options - Error handling configuration
 * @returns Result of fn() on success, fallbackValue (or null) on error
 *
 * @example
 * ```typescript
 * const profile = handleErrorSync(
 *   () => {
 *     const saved = localStorage.getItem('profile');
 *     return saved ? JSON.parse(saved) : null;
 *   },
 *   {
 *     operation: 'loadProfileFromStorage',
 *     fallbackValue: null,
 *     context: { storage: 'localStorage' }
 *   }
 * );
 * ```
 */
export function handleErrorSync<T>(
  fn: () => T,
  options: ErrorHandlerOptions
): T | null {
  try {
    return fn();
  } catch (error) {
    logError(error, options);
    return (options.fallbackValue ?? null) as T | null;
  }
}

/**
 * Internal function to log errors consistently
 */
function logError(error: unknown, options: ErrorHandlerOptions): void {
  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(
      `[${options.operation}] Error:`,
      error,
      options.context ? `\nContext: ${JSON.stringify(options.context, null, 2)}` : ''
    );
  }

  // TODO: Log to external service in production
  if (options.logToService && process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { tags: { operation: options.operation }, extra: options.context });
  }

  // Show toast notification if requested
  if (options.showToast && typeof window !== 'undefined') {
    const message = getErrorMessage(error);
    console.warn(`[${options.operation}] ${message}`);
    // TODO: Integrate with toast/notification system when available
  }
}

/**
 * Extracts a user-friendly error message from any error type
 *
 * @param error - Error of any type
 * @returns Human-readable error message
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   alert(getErrorMessage(error)); // "Network request failed"
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
}

/**
 * Type guard to check if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!isError(error)) return false;
  return (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('Failed to fetch') ||
    error.name === 'NetworkError'
  );
}

/**
 * Type guard to check if error is a quota exceeded error
 */
export function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

// ==================== Safe LocalStorage Utilities ====================

/**
 * Safely get an item from localStorage with JSON parsing
 *
 * Handles all possible errors:
 * - localStorage not available (private browsing, SSR)
 * - JSON parse errors (corrupted data)
 * - Any other unexpected errors
 *
 * @param key - localStorage key
 * @param fallback - Value to return on error
 * @returns Parsed value or fallback
 *
 * @example
 * ```typescript
 * const profile = safeGetItem<UserProfile>('profile', null);
 * if (profile) {
 *   console.log('Loaded profile:', profile);
 * }
 * ```
 */
export function safeGetItem<T>(key: string, fallback: T): T {
  return handleErrorSync<T>(
    () => {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage not available');
      }

      const item = localStorage.getItem(key);

      // Return fallback if item doesn't exist
      if (item === null) {
        return fallback;
      }

      // Parse JSON
      return JSON.parse(item) as T;
    },
    {
      operation: 'safeGetItem',
      fallbackValue: fallback,
      showToast: false,
      context: { key },
    }
  ) as T;
}

/**
 * Safely set an item in localStorage with JSON stringification
 *
 * Handles all possible errors:
 * - localStorage not available (private browsing, SSR)
 * - QuotaExceededError (storage full)
 * - JSON stringify errors (circular references)
 * - Any other unexpected errors
 *
 * @param key - localStorage key
 * @param value - Value to store
 * @returns true if successful, false if error occurred
 *
 * @example
 * ```typescript
 * const success = safeSetItem('profile', userProfile);
 * if (!success) {
 *   console.warn('Failed to save profile');
 * }
 * ```
 */
export function safeSetItem<T>(key: string, value: T): boolean {
  const result = handleErrorSync<boolean>(
    () => {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage not available');
      }

      // Stringify and save
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);

      return true;
    },
    {
      operation: 'safeSetItem',
      fallbackValue: false,
      showToast: false,
      context: { key, valueSize: JSON.stringify(value).length },
    }
  );

  // Special handling for quota exceeded
  if (!result) {
    // Try to identify if it was a quota error and attempt cleanup
    try {
      localStorage.setItem('__test__', 'test');
      localStorage.removeItem('__test__');
    } catch (testError) {
      if (isQuotaExceededError(testError)) {
        console.warn(
          `localStorage quota exceeded. Current usage: ${getStorageSize()}KB. Consider clearing old data.`
        );
        // TODO: Implement automatic cleanup strategy
        // - Remove oldest items
        // - Compress data
        // - Migrate to IndexedDB
      }
    }
  }

  return result ?? false;
}

/**
 * Safely remove an item from localStorage
 *
 * @param key - localStorage key
 * @returns true if successful, false if error occurred
 */
export function safeRemoveItem(key: string): boolean {
  return (
    handleErrorSync<boolean>(
      () => {
        if (typeof window === 'undefined' || !window.localStorage) {
          throw new Error('localStorage not available');
        }

        localStorage.removeItem(key);
        return true;
      },
      {
        operation: 'safeRemoveItem',
        fallbackValue: false,
        showToast: false,
        context: { key },
      }
    ) ?? false
  );
}

/**
 * Safely clear all items from localStorage
 *
 * @returns true if successful, false if error occurred
 */
export function safeClearStorage(): boolean {
  return (
    handleErrorSync<boolean>(
      () => {
        if (typeof window === 'undefined' || !window.localStorage) {
          throw new Error('localStorage not available');
        }

        localStorage.clear();
        return true;
      },
      {
        operation: 'safeClearStorage',
        fallbackValue: false,
        showToast: false,
      }
    ) ?? false
  );
}

/**
 * Get approximate size of localStorage usage in KB
 *
 * @returns Size in KB or 0 if error
 */
export function getStorageSize(): number {
  return (
    handleErrorSync<number>(
      () => {
        if (typeof window === 'undefined' || !window.localStorage) {
          return 0;
        }

        let total = 0;
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            const value = localStorage.getItem(key) || '';
            total += key.length + value.length;
          }
        }

        // Convert to KB
        return Math.round((total * 2) / 1024); // *2 for UTF-16 encoding
      },
      {
        operation: 'getStorageSize',
        fallbackValue: 0,
        showToast: false,
      }
    ) ?? 0
  );
}

/**
 * Check if localStorage is available and working
 *
 * @returns true if localStorage is available, false otherwise
 */
export function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    // Test read/write
    const testKey = '__ortokompanion_test__';
    localStorage.setItem(testKey, 'test');
    const result = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);

    return result === 'test';
  } catch {
    return false;
  }
}
