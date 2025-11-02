/**
 * Rate Limiter for API Routes
 * Simple in-memory rate limiting using token bucket algorithm
 *
 * Features:
 * - Token bucket algorithm
 * - Per-user/IP tracking
 * - Configurable limits
 * - Works in Edge Runtime
 * - Auto-cleanup of old entries
 */

interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Optional: Custom identifier function (default: IP address)
   */
  keyGenerator?: (request: Request) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory store for rate limit data
 * In production, consider using Redis for distributed rate limiting
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries every 5 minutes
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Default key generator - uses IP address or user ID from header
 */
function defaultKeyGenerator(request: Request): string {
  // Try to get user ID from header (if authenticated)
  const userId = request.headers.get('x-user-id');
  if (userId) return `user:${userId}`;

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `ip:${ip}`;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a request
 *
 * @param request - The incoming request
 * @param config - Rate limit configuration
 * @returns Rate limit result with remaining quota
 *
 * @example
 * ```typescript
 * const result = checkRateLimit(request, {
 *   maxRequests: 100,
 *   windowMs: 60000, // 1 minute
 * });
 *
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: 'Too many requests' },
 *     {
 *       status: 429,
 *       headers: {
 *         'X-RateLimit-Limit': result.limit.toString(),
 *         'X-RateLimit-Remaining': result.remaining.toString(),
 *         'X-RateLimit-Reset': result.reset.toString(),
 *       }
 *     }
 *   );
 * }
 * ```
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig
): RateLimitResult {
  const keyGenerator = config.keyGenerator || defaultKeyGenerator;
  const key = keyGenerator(request);

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No entry exists - create new one
  if (!entry) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: now + config.windowMs,
    };
  }

  // Entry expired - reset
  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + config.windowMs;

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: entry.resetTime,
    };
  }

  // Entry exists and not expired
  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  /**
   * Strict limit for expensive AI operations
   * 20 requests per minute
   */
  AI_STRICT: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },

  /**
   * Standard limit for normal AI operations
   * 60 requests per minute
   */
  AI_STANDARD: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
  },

  /**
   * Generous limit for chat operations
   * 100 requests per minute
   */
  AI_CHAT: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },

  /**
   * Very strict for unauthenticated requests
   * 10 requests per minute
   */
  ANONYMOUS: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Helper to create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
  };
}

/**
 * Get current rate limit stats for monitoring
 */
export function getRateLimitStats(): {
  totalKeys: number;
  memoryUsageKB: number;
} {
  const memoryUsageKB = Math.round(
    (rateLimitStore.size * 100) / 1024 // Rough estimate
  );

  return {
    totalKeys: rateLimitStore.size,
    memoryUsageKB,
  };
}

/**
 * Clear all rate limit data (for testing)
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}
