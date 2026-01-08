// Rate limiting utilities

import { getRateLimitConfig } from "./tokens";

interface RateLimitEntry {
  count: number;
  resetAt: Date;
}

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if a request should be rate limited
 * Returns true if rate limit is exceeded, false otherwise
 */
export function checkRateLimit(identifier: string): boolean {
  const config = getRateLimitConfig();
  const now = new Date();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    // Create new entry or reset expired entry
    const resetAt = new Date();
    resetAt.setMinutes(resetAt.getMinutes() + config.windowMinutes);
    
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt,
    });
    return false; // Not rate limited
  }

  if (entry.count >= config.maxAttempts) {
    return true; // Rate limited
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);
  return false; // Not rate limited
}

/**
 * Clear rate limit for an identifier
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get remaining attempts for an identifier
 */
export function getRemainingAttempts(identifier: string): number {
  const config = getRateLimitConfig();
  const entry = rateLimitStore.get(identifier);
  
  if (!entry) {
    return config.maxAttempts;
  }

  const now = new Date();
  if (now > entry.resetAt) {
    return config.maxAttempts;
  }

  return Math.max(0, config.maxAttempts - entry.count);
}
