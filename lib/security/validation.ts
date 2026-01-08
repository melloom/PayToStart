// Additional security validation utilities

import { z } from "zod";

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate email format (strict)
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate URL is safe (no javascript:, data:, etc.)
 */
export function isSafeURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Block dangerous protocols
    const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"];
    if (dangerousProtocols.some(protocol => parsed.protocol.toLowerCase().startsWith(protocol))) {
      return false;
    }
    // Only allow http/https
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false; // Invalid URL
  }
}

/**
 * Validate and sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  let sanitized = fileName.replace(/\.\./g, "");
  sanitized = sanitized.replace(/[\/\\]/g, "_"); // Replace path separators
  sanitized = sanitized.replace(/[<>:"|?*]/g, ""); // Remove invalid characters
  sanitized = sanitized.trim();
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf("."));
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }
  
  return sanitized || "file";
}

/**
 * Validate request size (prevent large payload attacks)
 */
export function validateRequestSize(content: string | Buffer, maxSize: number = 10 * 1024 * 1024): boolean {
  const size = typeof content === "string" ? Buffer.byteLength(content, "utf8") : content.length;
  return size <= maxSize;
}

/**
 * Validate rate limit identifier (prevent injection)
 */
export function sanitizeRateLimitKey(key: string): string {
  // Only allow alphanumeric, colon, dash, underscore
  return key.replace(/[^a-zA-Z0-9:._-]/g, "").substring(0, 255);
}

