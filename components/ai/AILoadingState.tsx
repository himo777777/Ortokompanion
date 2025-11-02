/**
 * Unified AI Loading State Component
 * Provides consistent loading UX across all AI features
 *
 * Features:
 * - Multiple loading variants (spinner, skeleton, pulse)
 * - Animated states with smooth transitions
 * - Contextual messages
 * - Abort capability
 * - Progress indication
 */

'use client';

import { useEffect, useState } from 'react';

export type AILoadingVariant = 'spinner' | 'skeleton' | 'pulse' | 'dots';

export interface AILoadingStateProps {
  /**
   * Loading variant to display
   * @default 'spinner'
   */
  variant?: AILoadingVariant;

  /**
   * Message to show while loading
   * @default 'AI tänker...'
   */
  message?: string;

  /**
   * Show estimated time remaining
   */
  showEstimate?: boolean;

  /**
   * Estimated time in seconds (for progress indication)
   */
  estimatedTime?: number;

  /**
   * Show cancel button
   */
  showCancel?: boolean;

  /**
   * Callback when user clicks cancel
   */
  onCancel?: () => void;

  /**
   * Size of the loading indicator
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Full-screen overlay mode
   * @default false
   */
  overlay?: boolean;
}

export default function AILoadingState({
  variant = 'spinner',
  message = 'AI tänker...',
  showEstimate = false,
  estimatedTime,
  showCancel = false,
  onCancel,
  size = 'md',
  overlay = false,
}: AILoadingStateProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!showEstimate) return;

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [showEstimate]);

  const progress = estimatedTime ? Math.min((elapsed / estimatedTime) * 100, 95) : 0;

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Loading Indicator */}
      {variant === 'spinner' && <SpinnerLoader size={size} />}
      {variant === 'skeleton' && <SkeletonLoader size={size} />}
      {variant === 'pulse' && <PulseLoader size={size} />}
      {variant === 'dots' && <DotsLoader size={size} />}

      {/* Message */}
      {message && (
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {message}
          </p>
          {showEstimate && estimatedTime && (
            <p className="mt-1 text-xs text-gray-500">
              Cirka {Math.max(estimatedTime - elapsed, 0)}s kvar...
            </p>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {showEstimate && estimatedTime && (
        <div className="w-full max-w-xs">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Cancel Button */}
      {showCancel && onCancel && (
        <button
          onClick={onCancel}
          className="mt-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Avbryt
        </button>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
          {content}
        </div>
      </div>
    );
  }

  return <div className="py-8">{content}</div>;
}

/**
 * Spinner Loader
 */
function SpinnerLoader({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-blue-500 border-t-transparent`}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Skeleton Loader (for text content)
 */
function SkeletonLoader({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const lines = size === 'sm' ? 2 : size === 'md' ? 3 : 5;

  return (
    <div className="w-full max-w-md space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          style={{
            width: `${100 - Math.random() * 20}%`,
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Pulse Loader (for interactive elements)
 */
function PulseLoader({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32',
  };

  return (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} animate-ping absolute inline-flex rounded-full bg-blue-400 opacity-75`}
      />
      <div
        className={`${sizeClasses[size]} relative inline-flex items-center justify-center rounded-full bg-blue-500`}
      >
        <svg
          className="h-1/2 w-1/2 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>
    </div>
  );
}

/**
 * Dots Loader (minimalist)
 */
function DotsLoader({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} animate-bounce rounded-full bg-blue-500`}
          style={{
            animationDelay: `${i * 150}ms`,
            animationDuration: '600ms',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Contextual Loading Messages
 */
export const AILoadingMessages = {
  explanation: 'Skapar personlig förklaring...',
  hints: 'Genererar adaptiva ledtrådar...',
  analysis: 'Analyserar din prestation...',
  studyPlan: 'Skapar din studieplan...',
  chat: 'AI-handledaren tänker...',
  recommendation: 'Letar efter rekommendationer...',
  default: 'AI tänker...',
} as const;

/**
 * Hook for managing AI loading state
 */
export function useAILoading(estimatedTime?: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [controller, setController] = useState<AbortController | null>(null);

  const startLoading = () => {
    const abortController = new AbortController();
    setController(abortController);
    setIsLoading(true);
    return abortController;
  };

  const stopLoading = () => {
    setIsLoading(false);
    setController(null);
  };

  const cancel = () => {
    controller?.abort();
    stopLoading();
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    cancel,
    abortSignal: controller?.signal,
  };
}
