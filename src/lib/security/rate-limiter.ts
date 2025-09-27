interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

export class RateLimiter {
  private static store = new Map<string, RateLimitEntry>();

  public static readonly LIMITS = {
    API: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
    LOGIN: { requests: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    UPLOAD: { requests: 10, window: 5 * 60 * 1000 }, // 10 uploads per 5 minutes
    REGISTRATION: { requests: 3, window: 60 * 60 * 1000 }, // 3 registrations per hour
  };

  static check(
    identifier: string,
    type: keyof typeof RateLimiter.LIMITS
  ): { allowed: boolean; remainingRequests: number; resetTime: number } {
    const key = `${type}:${identifier}`;
    const limit = this.LIMITS[type];
    const now = Date.now();

    let entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + limit.window,
        blocked: false,
      };
    }

    entry.count++;

    if (entry.count > limit.requests) {
      entry.blocked = true;
      this.store.set(key, entry);

      // Log security event for repeated violations
      if (entry.count > limit.requests * 2) {
        console.warn(`[SECURITY HIGH] Rate limit violation: ${identifier} exceeded ${type} limit`, {
          count: entry.count,
          limit: limit.requests,
          type,
          identifier,
        });
      }

      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: entry.resetTime,
      };
    }

    this.store.set(key, entry);

    return {
      allowed: true,
      remainingRequests: Math.max(0, limit.requests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  static reset(identifier: string, type: keyof typeof RateLimiter.LIMITS): void {
    const key = `${type}:${identifier}`;
    this.store.delete(key);
  }

  static isBlocked(identifier: string, type: keyof typeof RateLimiter.LIMITS): boolean {
    const key = `${type}:${identifier}`;
    const entry = this.store.get(key);
    const now = Date.now();

    if (!entry || now > entry.resetTime) {
      return false;
    }

    return entry.blocked;
  }

  static cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  static getStats(): { totalEntries: number; blockedEntries: number } {
    const now = Date.now();
    let totalEntries = 0;
    let blockedEntries = 0;

    for (const entry of this.store.values()) {
      if (now <= entry.resetTime) {
        totalEntries++;
        if (entry.blocked) blockedEntries++;
      }
    }

    return { totalEntries, blockedEntries };
  }
}

// Clean up expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    RateLimiter.cleanup();
  }, 5 * 60 * 1000);
}