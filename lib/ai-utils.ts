/**
 * AI Utilities
 * Provides robust error handling, validation, and utilities for AI integrations
 */

import { z } from 'zod';

/**
 * AI Response Wrapper
 * Standard structure for all AI responses with error handling
 */
export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
  cached?: boolean;
  timestamp: number;
}

/**
 * AI Request Options
 */
export interface AIRequestOptions {
  timeout?: number; // milliseconds
  retries?: number;
  retryDelay?: number; // milliseconds
  abortSignal?: AbortSignal;
  cacheKey?: string;
  cacheTTL?: number; // seconds
}

/**
 * Default configuration
 */
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 1000; // 1 second
const DEFAULT_CACHE_TTL = 3600; // 1 hour

/**
 * Error codes for AI operations
 */
export enum AIErrorCode {
  TIMEOUT = 'AI_TIMEOUT',
  VALIDATION_ERROR = 'AI_VALIDATION_ERROR',
  PARSE_ERROR = 'AI_PARSE_ERROR',
  NETWORK_ERROR = 'AI_NETWORK_ERROR',
  RATE_LIMIT = 'AI_RATE_LIMIT',
  SERVER_ERROR = 'AI_SERVER_ERROR',
  UNKNOWN_ERROR = 'AI_UNKNOWN_ERROR',
}

/**
 * Custom AI Error class
 */
export class AIError extends Error {
  constructor(
    message: string,
    public code: AIErrorCode,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AIError';
  }
}

/**
 * Validates and parses AI response with schema
 */
export async function validateAIResponse<T>(
  response: Response,
  schema: z.ZodType<T>
): Promise<AIResponse<T>> {
  try {
    // Check HTTP status
    if (!response.ok) {
      if (response.status === 429) {
        throw new AIError(
          'Rate limit exceeded. Please try again later.',
          AIErrorCode.RATE_LIMIT,
          { status: response.status }
        );
      }

      if (response.status >= 500) {
        throw new AIError(
          'AI service is temporarily unavailable.',
          AIErrorCode.SERVER_ERROR,
          { status: response.status }
        );
      }

      throw new AIError(
        `Request failed with status ${response.status}`,
        AIErrorCode.NETWORK_ERROR,
        { status: response.status }
      );
    }

    // Parse JSON
    let jsonData: unknown;
    try {
      jsonData = await response.json();
    } catch (e) {
      throw new AIError(
        'Failed to parse AI response as JSON',
        AIErrorCode.PARSE_ERROR,
        e
      );
    }

    // Validate with Zod schema
    const parseResult = schema.safeParse(jsonData);

    if (!parseResult.success) {
      throw new AIError(
        'AI response validation failed',
        AIErrorCode.VALIDATION_ERROR,
        parseResult.error.format()
      );
    }

    return {
      success: true,
      data: parseResult.data,
      timestamp: Date.now(),
    };
  } catch (error) {
    if (error instanceof AIError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
        timestamp: Date.now(),
      };
    }

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: AIErrorCode.UNKNOWN_ERROR,
        details: error,
      },
      timestamp: Date.now(),
    };
  }
}

/**
 * Makes AI request with timeout, retries, and abort support
 */
export async function makeAIRequest<T>(
  url: string,
  body: unknown,
  schema: z.ZodType<T>,
  options: AIRequestOptions = {}
): Promise<AIResponse<T>> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    abortSignal,
  } = options;

  let lastError: AIError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create timeout controller
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

      // Combine timeout and user abort signals
      const combinedSignal = abortSignal
        ? combineAbortSignals([abortSignal, timeoutController.signal])
        : timeoutController.signal;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: combinedSignal,
        });

        clearTimeout(timeoutId);

        return await validateAIResponse(response, schema);
      } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new AIError(
            'Request timed out',
            AIErrorCode.TIMEOUT,
            { timeout, attempt }
          );
        }

        throw fetchError;
      }
    } catch (error) {
      lastError = error instanceof AIError
        ? error
        : new AIError(
            error instanceof Error ? error.message : 'Request failed',
            AIErrorCode.NETWORK_ERROR,
            error
          );

      // Don't retry on validation errors or rate limits
      if (
        lastError.code === AIErrorCode.VALIDATION_ERROR ||
        lastError.code === AIErrorCode.RATE_LIMIT
      ) {
        break;
      }

      // Wait before retry (except on last attempt)
      if (attempt < retries) {
        // Exponential backoff with jitter to prevent thundering herd
        const baseDelay = retryDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 1000; // Random 0-1000ms
        await sleep(baseDelay + jitter);
      }
    }
  }

  // All retries failed
  return {
    success: false,
    error: {
      message: lastError?.message || 'Request failed after retries',
      code: lastError?.code || AIErrorCode.UNKNOWN_ERROR,
      details: lastError?.details,
    },
    timestamp: Date.now(),
  };
}

/**
 * Combines multiple AbortSignals into one
 */
function combineAbortSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  return controller.signal;
}

/**
 * Sleep utility for retries
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sanitizes error for client display
 * Removes sensitive details while keeping useful information
 */
export function sanitizeErrorForClient(error: unknown): {
  message: string;
  code?: string;
} {
  if (error instanceof AIError) {
    return {
      message: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      message: 'An unexpected error occurred. Please try again.',
      code: AIErrorCode.UNKNOWN_ERROR,
    };
  }

  return {
    message: 'An unknown error occurred. Please try again.',
    code: AIErrorCode.UNKNOWN_ERROR,
  };
}

/**
 * Type guard for AIResponse
 */
export function isAISuccess<T>(response: AIResponse<T>): response is AIResponse<T> & { data: T } {
  return response.success && response.data !== undefined;
}

/**
 * Safely converts string to AIErrorCode
 * @param code - Error code string from API response
 * @returns Valid AIErrorCode or UNKNOWN_ERROR as fallback
 */
export function toAIErrorCode(code: string | undefined): AIErrorCode {
  if (!code) return AIErrorCode.UNKNOWN_ERROR;

  // Check if code matches any enum value
  const enumValues = Object.values(AIErrorCode);
  if (enumValues.includes(code as AIErrorCode)) {
    return code as AIErrorCode;
  }

  return AIErrorCode.UNKNOWN_ERROR;
}

/**
 * Creates a fallback response for when AI fails
 */
export function createFallbackResponse<T>(fallbackData: T): AIResponse<T> {
  return {
    success: true,
    data: fallbackData,
    timestamp: Date.now(),
  };
}

/**
 * Logs AI errors for monitoring (can be extended with external logging)
 */
export function logAIError(
  operation: string,
  error: AIError | Error,
  context?: Record<string, unknown>
): void {
  const errorInfo = {
    operation,
    message: error.message,
    code: error instanceof AIError ? error.code : 'UNKNOWN',
    timestamp: new Date().toISOString(),
    context,
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('[AI Error]', errorInfo);
  }

  // In production, this could send to monitoring service
  // Example: Sentry, LogRocket, etc.
}

// ==================== Type Conversion Helpers ====================

/**
 * Valid EducationLevel values
 */
const VALID_EDUCATION_LEVELS = new Set([
  'student',
  'at',
  'st1',
  'st2',
  'st3',
  'st4',
  'st5',
  'st-allmänmedicin',
  'st-akutsjukvård',
  'specialist-ortopedi',
  'specialist-allmänmedicin',
  'specialist-akutsjukvård',
]);

/**
 * Valid Domain values
 */
const VALID_DOMAINS = new Set([
  'trauma',
  'axel-armbåge',
  'hand-handled',
  'rygg',
  'höft',
  'knä',
  'fot-fotled',
  'sport',
  'tumör',
]);

/**
 * Valid Competency values
 */
const VALID_COMPETENCIES = new Set([
  'medicinsk-kunskap',
  'klinisk-färdighet',
  'kommunikation',
  'professionalism',
  'samverkan',
  'utveckling',
]);

/**
 * Valid SRSCardType values
 */
const VALID_SRS_CARD_TYPES = new Set([
  'microcase',
  'quiz',
  'pearl',
  'rx',
  'evidence',
  'beslutstraad',
]);

/**
 * Valid SubCompetency values
 */
const VALID_SUB_COMPETENCIES = new Set([
  'diagnostik',
  'akuta-flöden',
  'operativa-principer',
  'komplikationer',
  'evidens',
  'bildtolkning',
  'dokumentation',
  'kommunikation',
]);

/**
 * Safely converts string to EducationLevel
 * @param value - String value to convert
 * @returns Valid EducationLevel or null if invalid
 */
export function toLevelType(value: string | undefined): string | null {
  if (!value) return null;
  return VALID_EDUCATION_LEVELS.has(value) ? value : null;
}

/**
 * Safely converts string to Domain
 * @param value - String value to convert
 * @returns Valid Domain or null if invalid
 */
export function toDomain(value: string | undefined): string | null {
  if (!value) return null;
  return VALID_DOMAINS.has(value) ? value : null;
}

/**
 * Safely converts string to Competency
 * @param value - String value to convert
 * @returns Valid Competency or null if invalid
 */
export function toCompetency(value: string | undefined): string | null {
  if (!value) return null;
  return VALID_COMPETENCIES.has(value) ? value : null;
}

/**
 * Safely converts string to SRSCardType
 * @param value - String value to convert
 * @returns Valid SRSCardType or null if invalid
 */
export function toSRSCardType(value: string | undefined): string | null {
  if (!value) return null;
  return VALID_SRS_CARD_TYPES.has(value) ? value : null;
}

/**
 * Safely converts string to SubCompetency
 * @param value - String value to convert
 * @returns Valid SubCompetency or null if invalid
 */
export function toSubCompetency(value: string | undefined): string | null {
  if (!value) return null;
  return VALID_SUB_COMPETENCIES.has(value) ? value : null;
}

/**
 * Safely converts string array to SubCompetency array
 * @param values - String array to convert
 * @returns Array of valid SubCompetencies (filters out invalid ones)
 */
export function toSubCompetencies(values: string[] | undefined): string[] {
  if (!values || !Array.isArray(values)) return [];
  return values.filter(v => VALID_SUB_COMPETENCIES.has(v));
}

/**
 * Type guard for profile progression property
 */
export function hasProgression(profile: any): profile is { progression: any } {
  return profile && typeof profile === 'object' && 'progression' in profile && profile.progression != null;
}

/**
 * Type guard for profile progression SRS
 */
export function hasSRS(profile: any): profile is { progression: { srs: any } } {
  return hasProgression(profile) && 'srs' in profile.progression && profile.progression.srs != null;
}

/**
 * Type guard for profile progression domain statuses
 */
export function hasDomainStatuses(profile: any): profile is { progression: { domainStatuses: Record<string, any> } } {
  return hasProgression(profile) && 'domainStatuses' in profile.progression && profile.progression.domainStatuses != null;
}

/**
 * Type guard for profile progression history
 */
export function hasHistory(profile: any): profile is { progression: { history: any } } {
  return hasProgression(profile) && 'history' in profile.progression && profile.progression.history != null;
}

/**
 * Type guard for profile progression band status
 */
export function hasBandStatus(profile: any): profile is { progression: { bandStatus: any } } {
  return hasProgression(profile) && 'bandStatus' in profile.progression && profile.progression.bandStatus != null;
}
