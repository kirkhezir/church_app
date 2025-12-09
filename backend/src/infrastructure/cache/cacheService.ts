import Redis from 'ioredis';
import { logger } from '../logging/logger';

/**
 * Redis Cache Service
 *
 * Provides caching functionality for the application.
 * Supports session storage, API response caching, and rate limiting.
 */

// Redis connection configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';

// Cache key prefixes for namespacing
const CACHE_PREFIXES = {
  SESSION: 'session:',
  REFRESH_TOKEN: 'refresh_token:',
  RATE_LIMIT: 'rate_limit:',
  API_CACHE: 'cache:',
  USER: 'user:',
  EVENT: 'event:',
  ANNOUNCEMENT: 'announcement:',
} as const;

// Default TTL values in seconds
const DEFAULT_TTL = {
  SESSION: 86400, // 24 hours
  REFRESH_TOKEN: 604800, // 7 days
  RATE_LIMIT: 900, // 15 minutes
  API_CACHE: 300, // 5 minutes
  SHORT: 60, // 1 minute
  MEDIUM: 600, // 10 minutes
  LONG: 3600, // 1 hour
} as const;

class CacheService {
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    if (REDIS_ENABLED) {
      this.connect();
    } else {
      logger.info('Redis caching is disabled');
    }
  }

  /**
   * Connect to Redis
   */
  private connect(): void {
    try {
      this.client = new Redis(REDIS_URL, {
        password: REDIS_PASSWORD,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            logger.error('Redis connection failed after 3 retries');
            return null; // Stop retrying
          }
          return Math.min(times * 100, 3000);
        },
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis connected successfully');
      });

      this.client.on('error', (error) => {
        logger.error('Redis connection error', { error: error.message });
        this.isConnected = false;
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('Redis connection closed');
      });

      // Connect immediately
      this.client.connect().catch((error) => {
        logger.error('Failed to connect to Redis', { error: error.message });
      });
    } catch (error) {
      logger.error('Failed to initialize Redis client', { error });
    }
  }

  /**
   * Check if cache is available
   */
  isAvailable(): boolean {
    return REDIS_ENABLED && this.isConnected && this.client !== null;
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) return null;

    try {
      const value = await this.client!.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  /**
   * Set a value in cache with TTL
   */
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client!.setex(key, ttlSeconds, serialized);
      } else {
        await this.client!.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error });
      return false;
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      await this.client!.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      return false;
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.isAvailable()) return 0;

    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length > 0) {
        await this.client!.del(...keys);
      }
      return keys.length;
    } catch (error) {
      logger.error('Cache deletePattern error', { pattern, error });
      return 0;
    }
  }

  // ==========================================
  // Session Management
  // ==========================================

  /**
   * Store a refresh token
   */
  async storeRefreshToken(
    userId: string,
    token: string,
    ttlSeconds = DEFAULT_TTL.REFRESH_TOKEN
  ): Promise<boolean> {
    const key = `${CACHE_PREFIXES.REFRESH_TOKEN}${userId}:${token}`;
    return this.set(key, { userId, createdAt: new Date().toISOString() }, ttlSeconds);
  }

  /**
   * Validate a refresh token exists
   */
  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const key = `${CACHE_PREFIXES.REFRESH_TOKEN}${userId}:${token}`;
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Revoke a refresh token
   */
  async revokeRefreshToken(userId: string, token: string): Promise<boolean> {
    const key = `${CACHE_PREFIXES.REFRESH_TOKEN}${userId}:${token}`;
    return this.delete(key);
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<number> {
    const pattern = `${CACHE_PREFIXES.REFRESH_TOKEN}${userId}:*`;
    return this.deletePattern(pattern);
  }

  // ==========================================
  // Rate Limiting
  // ==========================================

  /**
   * Check and increment rate limit counter
   * Returns remaining attempts or -1 if limit exceeded
   */
  async checkRateLimit(
    identifier: string,
    maxAttempts: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    if (!this.isAvailable()) {
      // Fallback: allow all requests if Redis is unavailable
      return { allowed: true, remaining: maxAttempts, resetIn: 0 };
    }

    const key = `${CACHE_PREFIXES.RATE_LIMIT}${identifier}`;

    try {
      const multi = this.client!.multi();
      multi.incr(key);
      multi.ttl(key);
      const results = await multi.exec();

      if (!results) {
        return { allowed: true, remaining: maxAttempts, resetIn: 0 };
      }

      const count = results[0][1] as number;
      let ttl = results[1][1] as number;

      // Set expiry on first request
      if (ttl === -1) {
        await this.client!.expire(key, windowSeconds);
        ttl = windowSeconds;
      }

      const allowed = count <= maxAttempts;
      const remaining = Math.max(0, maxAttempts - count);

      return { allowed, remaining, resetIn: ttl };
    } catch (error) {
      logger.error('Rate limit check error', { identifier, error });
      return { allowed: true, remaining: maxAttempts, resetIn: 0 };
    }
  }

  // ==========================================
  // API Response Caching
  // ==========================================

  /**
   * Cache an API response
   */
  async cacheResponse(
    endpoint: string,
    params: Record<string, unknown>,
    data: unknown,
    ttlSeconds = DEFAULT_TTL.API_CACHE
  ): Promise<boolean> {
    const key = this.buildCacheKey(endpoint, params);
    return this.set(key, data, ttlSeconds);
  }

  /**
   * Get cached API response
   */
  async getCachedResponse<T>(endpoint: string, params: Record<string, unknown>): Promise<T | null> {
    const key = this.buildCacheKey(endpoint, params);
    return this.get<T>(key);
  }

  /**
   * Invalidate cached responses for an endpoint
   */
  async invalidateEndpoint(endpoint: string): Promise<number> {
    const pattern = `${CACHE_PREFIXES.API_CACHE}${endpoint}:*`;
    return this.deletePattern(pattern);
  }

  /**
   * Build a cache key from endpoint and params
   */
  private buildCacheKey(endpoint: string, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return `${CACHE_PREFIXES.API_CACHE}${endpoint}:${sortedParams}`;
  }

  // ==========================================
  // Entity Caching Helpers
  // ==========================================

  /**
   * Cache user data
   */
  async cacheUser(userId: string, userData: unknown): Promise<boolean> {
    const key = `${CACHE_PREFIXES.USER}${userId}`;
    return this.set(key, userData, DEFAULT_TTL.MEDIUM);
  }

  /**
   * Get cached user data
   */
  async getCachedUser<T>(userId: string): Promise<T | null> {
    const key = `${CACHE_PREFIXES.USER}${userId}`;
    return this.get<T>(key);
  }

  /**
   * Invalidate user cache
   */
  async invalidateUser(userId: string): Promise<boolean> {
    const key = `${CACHE_PREFIXES.USER}${userId}`;
    return this.delete(key);
  }

  /**
   * Cache event data
   */
  async cacheEvent(eventId: string, eventData: unknown): Promise<boolean> {
    const key = `${CACHE_PREFIXES.EVENT}${eventId}`;
    return this.set(key, eventData, DEFAULT_TTL.MEDIUM);
  }

  /**
   * Get cached event data
   */
  async getCachedEvent<T>(eventId: string): Promise<T | null> {
    const key = `${CACHE_PREFIXES.EVENT}${eventId}`;
    return this.get<T>(key);
  }

  /**
   * Invalidate event cache
   */
  async invalidateEvent(eventId: string): Promise<boolean> {
    const key = `${CACHE_PREFIXES.EVENT}${eventId}`;
    return this.delete(key);
  }

  /**
   * Invalidate all event caches
   */
  async invalidateAllEvents(): Promise<number> {
    return this.deletePattern(`${CACHE_PREFIXES.EVENT}*`);
  }

  // ==========================================
  // Connection Management
  // ==========================================

  /**
   * Gracefully disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis disconnected');
    }
  }

  /**
   * Get Redis client status
   */
  getStatus(): { enabled: boolean; connected: boolean } {
    return {
      enabled: REDIS_ENABLED,
      connected: this.isConnected,
    };
  }
}

// Export singleton instance
export const cacheService = new CacheService();
export { CACHE_PREFIXES, DEFAULT_TTL };
