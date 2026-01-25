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

/**
 * Validate file type by MIME type
 */
export function isValidFileType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Validate file extension
 */
export function isValidFileExtension(
  fileName: string,
  allowedExtensions: string[]
): boolean {
  const ext = fileName.toLowerCase().split(".").pop();
  if (!ext) return false;
  return allowedExtensions.includes(`.${ext}`);
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhoneNumber(phone: string): string | null {
  if (!phone || typeof phone !== "string") {
    return null;
  }
  
  // Remove all non-digit characters except + at the start
  let sanitized = phone.trim();
  if (sanitized.startsWith("+")) {
    sanitized = "+" + sanitized.substring(1).replace(/\D/g, "");
  } else {
    sanitized = sanitized.replace(/\D/g, "");
  }
  
  // Validate length (international format: 7-15 digits, +country code)
  if (sanitized.length < 7 || sanitized.length > 16) {
    return null;
  }
  
  return sanitized;
}

/**
 * Validate integer range
 */
export function isValidInteger(
  value: any,
  min?: number,
  max?: number
): boolean {
  const num = parseInt(String(value), 10);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

/**
 * Validate float range
 */
export function isValidFloat(
  value: any,
  min?: number,
  max?: number
): boolean {
  const num = parseFloat(String(value));
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

/**
 * Validate date string
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate base64 string
 */
export function isValidBase64(str: string): boolean {
  if (!str || typeof str !== "string") return false;
  
  // Remove data URL prefix if present
  const base64 = str.includes(",") ? str.split(",")[1] : str;
  
  // Check if it's valid base64
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(base64)) return false;
  
  // Try to decode (Node.js compatible)
  try {
    const decoded = Buffer.from(base64, "base64").toString("base64");
    return decoded === base64;
  } catch {
    return false;
  }
}

/**
 * Validate JSON string
 */
export function isValidJSON(str: string): boolean {
  if (!str || typeof str !== "string") return false;
  
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate IP address format
 */
export function isValidIP(ip: string): boolean {
  // IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split(".");
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  // IPv6 (basic validation)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv6Regex.test(ip);
}

/**
 * Validate domain name
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  
  const domainRegex = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
  return domainRegex.test(domain);
}

/**
 * Sanitize object recursively (remove dangerous properties)
 */
export function sanitizeObject(obj: any, maxDepth: number = 10): any {
  if (maxDepth <= 0) return null;
  
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === "string") {
    // Sanitize strings
    return obj
      .replace(/\0/g, "")
      .replace(/<script/gi, "")
      .replace(/javascript:/gi, "")
      .substring(0, 10000);
  }
  
  if (typeof obj === "number" || typeof obj === "boolean") {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, maxDepth - 1));
  }
  
  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Sanitize key
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, "");
        if (sanitizedKey) {
          sanitized[sanitizedKey] = sanitizeObject(obj[key], maxDepth - 1);
        }
      }
    }
    return sanitized;
  }
  
  return null;
}




