// Secure token generation and verification utilities

import { randomBytes, createHash, timingSafeEqual } from "crypto";

// Token configuration
const TOKEN_BYTES = 32; // 32 bytes = 256 bits
const TOKEN_EXPIRY_DAYS = 7;
const RATE_LIMIT_WINDOW_MINUTES = 15;
const MAX_ATTEMPTS_PER_WINDOW = 5;

// Get secret from environment (fallback for development)
const TOKEN_SECRET = process.env.SIGNING_TOKEN_SECRET || "change-me-in-production-very-secure-secret-key";

// Security: Warn if using default secret in production
if (process.env.NODE_ENV === "production" && 
    (TOKEN_SECRET === "change-me-in-production-very-secure-secret-key" || 
     TOKEN_SECRET.length < 32)) {
  console.error("⚠️  SECURITY WARNING: SIGNING_TOKEN_SECRET is not set to a secure value in production!");
  console.error("   Generate a secure secret with: openssl rand -hex 32");
}

/**
 * Generate a secure random token (32+ bytes)
 * Returns the raw token that should be sent to the client
 */
export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex"); // 64 character hex string
}

/**
 * Hash a token using SHA256 + secret
 * This is what we store in the database
 */
export function hashToken(token: string): string {
  const hash = createHash("sha256");
  hash.update(token + TOKEN_SECRET);
  return hash.digest("hex");
}

/**
 * Verify a token against a stored hash
 * Uses timing-safe comparison to prevent timing attacks
 */
export function verifyToken(token: string, storedHash: string): boolean {
  const computedHash = hashToken(token);
  
  // Convert hex strings to buffers for timing-safe comparison
  const computedBuffer = Buffer.from(computedHash, "hex");
  const storedBuffer = Buffer.from(storedHash, "hex");
  
  // Timing-safe comparison to prevent timing attacks
  if (computedBuffer.length !== storedBuffer.length) {
    return false;
  }
  
  try {
    return timingSafeEqual(computedBuffer, storedBuffer);
  } catch {
    return false;
  }
}

/**
 * Calculate token expiry date (default 7 days from now)
 */
export function getTokenExpiry(days: number = TOKEN_EXPIRY_DAYS): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}

/**
 * Check if a token has expired
 */
export function isTokenExpired(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false; // No expiry means never expires (legacy contracts)
  return new Date() > new Date(expiresAt);
}

/**
 * Get rate limit configuration
 */
export function getRateLimitConfig() {
  return {
    windowMinutes: RATE_LIMIT_WINDOW_MINUTES,
    maxAttempts: MAX_ATTEMPTS_PER_WINDOW,
  };
}
