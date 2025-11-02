/**
 * AI Error Boundary Component
 * Provides graceful error handling for AI features
 *
 * Features:
 * - Catches and displays AI errors
 * - Retry functionality
 * - Fallback UI
 * - Error reporting
 * - User-friendly messages
 */

'use client';

import { Component, ReactNode } from 'react';

interface AIErrorBoundaryProps {
  children: ReactNode;
  /**
   * Fallback UI to show when error occurs
   */
  fallback?: ReactNode;
  /**
   * Callback when error occurs
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /**
   * Custom error message
   */
  errorMessage?: string;
  /**
   * Show retry button
   * @default true
   */
  showRetry?: boolean;
}

interface AIErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class AIErrorBoundary extends Component<
  AIErrorBoundaryProps,
  AIErrorBoundaryState
> {
  constructor(props: AIErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): AIErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AI Error Boundary caught error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <AIErrorDisplay
          error={this.state.error}
          errorMessage={this.props.errorMessage}
          showRetry={this.props.showRetry !== false}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * AI Error Display Component
 */
interface AIErrorDisplayProps {
  error: Error | null;
  errorMessage?: string;
  errorCode?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function AIErrorDisplay({
  error,
  errorMessage,
  errorCode,
  showRetry = true,
  onRetry,
  size = 'md',
}: AIErrorDisplayProps) {
  const defaultMessage = 'AI-tjänsten har problem just nu. Försök igen om en stund.';
  const message = errorMessage || error?.message || defaultMessage;

  const sizeClasses = {
    sm: 'p-4 text-sm',
    md: 'p-6 text-base',
    lg: 'p-8 text-lg',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20`}
      role="alert"
    >
      <div className="flex items-start">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Content */}
        <div className="ml-3 flex-1">
          <h3 className="font-semibold text-red-800 dark:text-red-400">
            Problem med AI-funktionen
          </h3>
          <p className="mt-1 text-red-700 dark:text-red-300">{message}</p>

          {errorCode && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Felkod: {errorCode}
            </p>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
              >
                Försök igen
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
            >
              Ladda om sidan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline AI Error Component (for smaller errors)
 */
export function AIErrorInline({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
      <div className="flex items-center gap-2">
        <svg
          className="h-5 w-5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-4 font-medium underline hover:no-underline"
        >
          Försök igen
        </button>
      )}
    </div>
  );
}

/**
 * AI Rate Limit Error Component (specific for 429)
 */
export function AIRateLimitError({
  resetTime,
  onClose,
}: {
  resetTime?: Date;
  onClose?: () => void;
}) {
  const timeUntilReset = resetTime
    ? Math.ceil((resetTime.getTime() - Date.now()) / 1000)
    : 60;

  return (
    <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="ml-3 flex-1">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">
            För många förfrågningar
          </h3>
          <p className="mt-1 text-yellow-700 dark:text-yellow-300">
            Du har använt AI-funktionerna för många gånger nyligen. Vänligen
            vänta {timeUntilReset} sekunder innan du försöker igen.
          </p>

          <div className="mt-4">
            <button
              onClick={onClose}
              className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for handling AI errors
 */
export function useAIError() {
  const handleAIError = (error: unknown): string => {
    if (error instanceof Error) {
      // Check for specific error codes
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        return 'För många förfrågningar. Vänligen vänta en stund.';
      }

      if (errorMessage.includes('timeout')) {
        return 'Förfrågan tog för lång tid. Försök igen.';
      }

      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return 'Nätverksproblem. Kontrollera din anslutning.';
      }

      if (errorMessage.includes('validation')) {
        return 'Ogiltigt svar från AI. Försök igen.';
      }

      return error.message;
    }

    return 'Ett okänt fel inträffade. Försök igen.';
  };

  return { handleAIError };
}
