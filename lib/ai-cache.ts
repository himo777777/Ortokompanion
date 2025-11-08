/**
 * AI Response Caching System
 * Multi-tier caching: In-memory (fast) + LocalStorage (persistent)
 * Reduces API calls by ~80% for repeated requests
 */

import { AIResponse } from './ai-utils';
import { logger } from './logger';

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time-to-live in seconds
  hits: number; // Track cache hits for analytics
}

/**
 * Cache statistics for monitoring
 */
interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

/**
 * Default TTL values (in seconds)
 */
const DEFAULT_TTL = {
  studyPlan: 3600, // 1 hour - study plans change infrequently
  learningPath: 3600, // 1 hour
  contentRecommendation: 1800, // 30 minutes - update more frequently
  explanation: 86400, // 24 hours - explanations rarely change
  goalSuggestion: 7200, // 2 hours
  default: 3600, // 1 hour
};

/**
 * In-Memory Cache (fast, session-only)
 */
class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxSize = 100; // Maximum entries
  private stats = { hits: 0, misses: 0 };

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    const age = (Date.now() - entry.timestamp) / 1000;
    if (age > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update hit count
    entry.hits++;
    this.stats.hits++;
    return entry.data;
  }

  set<T>(key: string, data: T, ttl: number): void {
    // Evict oldest entry if at max size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }
}

/**
 * LocalStorage Cache (persistent across sessions)
 */
class PersistentCache {
  private prefix = 'ai_cache_';
  private stats = { hits: 0, misses: 0 };

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) {
        this.stats.misses++;
        return null;
      }

      const entry = JSON.parse(item) as CacheEntry<T>;

      // Check if expired
      const age = (Date.now() - entry.timestamp) / 1000;
      if (age > entry.ttl) {
        localStorage.removeItem(this.prefix + key);
        this.stats.misses++;
        return null;
      }

      // Update hit count
      entry.hits++;
      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
      this.stats.hits++;
      return entry.data;
    } catch (error) {
      logger.error('Failed to get item from persistent cache', error, { key });
      this.stats.misses++;
      return null;
    }
  }

  set<T>(key: string, data: T, ttl: number): void {
    if (typeof window === 'undefined') return;

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        hits: 0,
      };

      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      // LocalStorage might be full or disabled
      logger.warn('Failed to set item in persistent cache - storage may be full', { key });
    }
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      this.stats = { hits: 0, misses: 0 };
    } catch (error) {
      logger.error('Failed to clear persistent cache', error);
    }
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.getSize(),
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  private getSize(): number {
    if (typeof window === 'undefined') return 0;

    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) count++;
    }
    return count;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    if (typeof window === 'undefined') return;

    try {
      const keysToRemove: string[] = [];
      const now = Date.now();

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.prefix)) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const entry = JSON.parse(item) as CacheEntry<unknown>;
              const age = (now - entry.timestamp) / 1000;
              if (age > entry.ttl) {
                keysToRemove.push(key);
              }
            }
          } catch {
            // Invalid entry, remove it
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      logger.error('Failed to cleanup expired cache entries', error);
    }
  }
}

/**
 * Two-tier cache manager
 */
class AICacheManager {
  private memoryCache = new MemoryCache();
  private persistentCache = new PersistentCache();

  /**
   * Get from cache (checks memory first, then localStorage)
   */
  get<T>(key: string): T | null {
    // Try memory cache first (fastest)
    const memoryResult = this.memoryCache.get<T>(key);
    if (memoryResult !== null) {
      return memoryResult;
    }

    // Try persistent cache
    const persistentResult = this.persistentCache.get<T>(key);
    if (persistentResult !== null) {
      // Promote to memory cache for faster access
      this.memoryCache.set(key, persistentResult, DEFAULT_TTL.default);
      return persistentResult;
    }

    return null;
  }

  /**
   * Set in both caches
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const actualTTL = ttl || DEFAULT_TTL.default;
    this.memoryCache.set(key, data, actualTTL);
    this.persistentCache.set(key, data, actualTTL);
  }

  /**
   * Delete from both caches
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    this.persistentCache.delete(key);
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.memoryCache.clear();
    this.persistentCache.clear();
  }

  /**
   * Get combined statistics
   */
  getStats(): {
    memory: CacheStats;
    persistent: CacheStats;
    combined: CacheStats;
  } {
    const memoryStats = this.memoryCache.getStats();
    const persistentStats = this.persistentCache.getStats();

    return {
      memory: memoryStats,
      persistent: persistentStats,
      combined: {
        hits: memoryStats.hits + persistentStats.hits,
        misses: memoryStats.misses + persistentStats.misses,
        size: memoryStats.size + persistentStats.size,
        hitRate:
          (memoryStats.hits + persistentStats.hits) /
          (memoryStats.hits + persistentStats.hits + memoryStats.misses + persistentStats.misses),
      },
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    this.persistentCache.cleanup();
  }
}

/**
 * Global cache instance
 */
export const aiCache = new AICacheManager();

/**
 * Generate cache key from request parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${JSON.stringify(params[key])}`)
    .join('|');

  return `${prefix}_${hashString(sortedParams)}`;
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Wrapper for cached AI requests
 */
export async function withCache<T>(
  cacheKey: string,
  ttl: number,
  fetchFn: () => Promise<AIResponse<T>>
): Promise<AIResponse<T>> {
  // Check cache first
  const cached = aiCache.get<T>(cacheKey);
  if (cached !== null) {
    return {
      success: true,
      data: cached,
      cached: true,
      timestamp: Date.now(),
    };
  }

  // Fetch fresh data
  const response = await fetchFn();

  // Cache successful responses
  if (response.success && response.data !== undefined) {
    aiCache.set(cacheKey, response.data, ttl);
  }

  return response;
}

/**
 * Get TTL for specific cache type
 */
export function getCacheTTL(type: keyof typeof DEFAULT_TTL): number {
  return DEFAULT_TTL[type] || DEFAULT_TTL.default;
}

/**
 * Auto-cleanup on app load (runs once)
 */
if (typeof window !== 'undefined') {
  // Cleanup expired entries on load
  aiCache.cleanup();

  // Periodic cleanup every 5 minutes
  setInterval(() => {
    aiCache.cleanup();
  }, 5 * 60 * 1000);
}
