// API security utilities and middleware helpers

import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { checkRateLimit } from "./rate-limit";
import type { Contractor } from "@/lib/types";

// Lazy load DOMPurify to avoid bundling issues
let DOMPurifyInstance: any = null;

async function getDOMPurify() {
  if (!DOMPurifyInstance) {
    try {
      const dompurify = await import("isomorphic-dompurify");
      DOMPurifyInstance = dompurify.default || dompurify;
    } catch (error) {
      console.warn("Failed to load DOMPurify, using fallback sanitization");
      DOMPurifyInstance = null;
    }
  }
  return DOMPurifyInstance;
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest | Request): string {
  // Check various headers for real IP (behind proxy/load balancer)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback to connection remote address (if available)
  return "unknown";
}

/**
 * Rate limit check for API routes
 * Returns error response if rate limited, null if allowed
 */
export function checkAPIRateLimit(
  request: NextRequest | Request,
  identifier?: string
): NextResponse | null {
  const ip = getClientIP(request);
  const rateLimitKey = identifier || ip;
  
  if (checkRateLimit(rateLimitKey)) {
    return NextResponse.json(
      { 
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later." 
      },
      { 
        status: 429,
        headers: {
          "Retry-After": "60",
        },
      }
    );
  }
  
  return null;
}

/**
 * Require authentication for API routes
 * Returns contractor if authenticated, null response if not
 */
export async function requireAuth(): Promise<{ contractor: Contractor; response: null } | { contractor: null; response: NextResponse }> {
  const contractor = await getCurrentContractor();
  
  if (!contractor) {
    return {
      contractor: null,
      response: NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      ),
    };
  }
  
  return { contractor, response: null };
}

/**
 * Validate request body size (prevent large payload attacks)
 */
export function validateBodySize(body: string, maxSize: number = 1024 * 1024): { valid: boolean; response?: NextResponse } {
  const bodySize = Buffer.byteLength(body, "utf8");
  
  if (bodySize > maxSize) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Payload too large", message: `Request body exceeds maximum size of ${maxSize} bytes` },
        { status: 413 }
      ),
    };
  }
  
  return { valid: true };
}

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  
  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, "")
    // Remove angle brackets
    .replace(/[<>]/g, "")
    // Remove javascript: protocol
    .replace(/javascript:/gi, "")
    // Remove data: protocol (can be used for XSS)
    .replace(/data:/gi, "")
    // Remove vbscript: protocol
    .replace(/vbscript:/gi, "")
    // Remove event handlers
    .replace(/on\w+\s*=/gi, "")
    // Remove SQL injection patterns
    .replace(/['";\\]/g, "")
    // Remove command injection patterns
    .replace(/[|&;`$()]/g, "")
    // Remove path traversal attempts
    .replace(/\.\./g, "")
    // Limit length to prevent buffer overflow
    .substring(0, 10000);
}

/**
 * Sanitize HTML content using DOMPurify (with fallback)
 * This function is async to support lazy loading of DOMPurify
 */
export async function sanitizeHTML(html: string, allowBasicFormatting: boolean = false): Promise<string> {
  if (typeof html !== "string") {
    return "";
  }
  
  // Try to use DOMPurify if available
  const DOMPurify = await getDOMPurify();
  if (DOMPurify) {
    const config = allowBasicFormatting
      ? {
          ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "a"],
          ALLOWED_ATTR: ["href", "target"],
          ALLOW_DATA_ATTR: false,
        }
      : {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
          ALLOW_DATA_ATTR: false,
        };
    
    return DOMPurify.sanitize(html, config);
  }
  
  // Fallback to basic sanitization if DOMPurify is not available
  return sanitizeHTMLSync(html, allowBasicFormatting);
}

/**
 * Synchronous version of sanitizeHTML that uses basic regex sanitization
 * Use this in Edge runtime contexts (middleware, etc.)
 */
export function sanitizeHTMLSync(html: string, allowBasicFormatting: boolean = false): string {
  if (typeof html !== "string") {
    return "";
  }
  
  // Basic sanitization without DOMPurify (for Edge runtime)
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframes
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .replace(/data:text\/html/gi, ""); // Remove data URIs
  
  if (!allowBasicFormatting) {
    // Remove all HTML tags if formatting not allowed
    sanitized = sanitized.replace(/<[^>]+>/g, "");
  }
  
  return sanitized;
}

/**
 * Sanitize SQL input (for additional protection, though Supabase uses parameterized queries)
 */
export function sanitizeSQL(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  
  return input
    .replace(/['";\\]/g, "")
    .replace(/--/g, "")
    .replace(/\/\*/g, "")
    .replace(/\*\//g, "")
    .replace(/;/g, "")
    .trim();
}

/**
 * Validate and sanitize file path (prevent path traversal)
 */
export function sanitizeFilePath(filePath: string): string | null {
  if (typeof filePath !== "string") {
    return null;
  }
  
  // Remove path traversal attempts
  let sanitized = filePath.replace(/\.\./g, "");
  
  // Remove absolute paths
  if (sanitized.startsWith("/") || sanitized.match(/^[a-zA-Z]:/)) {
    return null;
  }
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, "");
  
  // Limit length
  if (sanitized.length > 255) {
    return null;
  }
  
  return sanitized || null;
}

/**
 * Validate UUID format (prevent injection)
 */
export function validateUUID(uuid: string): boolean {
  if (typeof uuid !== "string") {
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Check for SQL injection patterns
 */
export function containsSQLInjection(input: string): boolean {
  if (typeof input !== "string") {
    return false;
  }
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
    /('|(\\')|(;)|(\\;)|(\|)|(\\|)|(\*)|(\\*)|(%)|(\\%)|(_)|(\\_))/g,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi,
    /\/\*.*?\*\//g,
    /(--)/g,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Check for command injection patterns
 */
export function containsCommandInjection(input: string): boolean {
  if (typeof input !== "string") {
    return false;
  }
  
  const commandPatterns = [
    /[|&;`$()]/,
    /\b(cat|ls|pwd|whoami|id|uname|ps|kill|rm|mv|cp|chmod|chown)\b/gi,
    /\$\{/,
    /\$\(/,
    /`/,
  ];
  
  return commandPatterns.some(pattern => pattern.test(input));
}

/**
 * Check for XSS patterns
 */
export function containsXSS(input: string): boolean {
  if (typeof input !== "string") {
    return false;
  }
  
  const xssPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return null;
  }
  
  // Additional checks
  if (sanitized.length > 254) { // RFC 5321 limit
    return null;
  }
  
  return sanitized;
}

/**
 * Generate secure error response (no sensitive info leakage)
 */
export function createSecureErrorResponse(
  message: string,
  status: number = 500,
  error?: unknown
): NextResponse {
  // Log full error server-side but don't expose to client
  if (error) {
    console.error(`[${status}] ${message}:`, error instanceof Error ? error.message : String(error));
  }
  
  // Only return generic message to client in production
  const isDevelopment = process.env.NODE_ENV === "development";
  const clientMessage = isDevelopment && error instanceof Error
    ? `${message}: ${error.message}`
    : message;
  
  return NextResponse.json(
    { 
      error: status >= 500 ? "Internal server error" : message,
      message: clientMessage,
    },
    { status }
  );
}

/**
 * Validate content type
 */
export function validateContentType(
  request: NextRequest | Request,
  allowedTypes: string[] = ["application/json"]
): NextResponse | null {
  const contentType = request.headers.get("content-type");
  
  if (!contentType) {
    return NextResponse.json(
      { error: "Missing content type" },
      { status: 400 }
    );
  }
  
  const isValid = allowedTypes.some(type => contentType.includes(type));
  
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid content type", message: `Expected one of: ${allowedTypes.join(", ")}` },
      { status: 415 }
    );
  }
  
  return null;
}

/**
 * Validate CSRF token (for state-changing operations)
 */
export function validateCSRFToken(
  request: NextRequest | Request,
  token?: string
): boolean {
  // For API routes, we rely on SameSite cookies and Origin header validation
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  
  // In production, validate origin matches expected domain
  if (process.env.NODE_ENV === "production") {
    const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || `https://${host}`;
    
    if (origin && !origin.startsWith(expectedOrigin)) {
      return false;
    }
    
    if (!origin && referer && !referer.startsWith(expectedOrigin)) {
      return false;
    }
  }
  
  // Additional CSRF token validation if provided
  if (token) {
    const csrfToken = request.headers.get("x-csrf-token");
    if (!csrfToken || csrfToken !== token) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validate request for injection attacks
 */
export function validateRequestSecurity(input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (typeof input === "string") {
    if (containsSQLInjection(input)) {
      errors.push("Potential SQL injection detected");
    }
    if (containsCommandInjection(input)) {
      errors.push("Potential command injection detected");
    }
    if (containsXSS(input)) {
      errors.push("Potential XSS attack detected");
    }
  } else if (typeof input === "object" && input !== null) {
    // Recursively check object properties
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const result = validateRequestSecurity(input[key]);
        if (!result.valid) {
          errors.push(...result.errors);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * API route security wrapper
 * Applies common security checks to API routes
 */
export async function secureAPIHandler<T>(
  request: NextRequest | Request,
  handler: (contractor: Contractor | null, body: any) => Promise<T>,
  options: {
    requireAuth?: boolean;
    rateLimit?: boolean;
    maxBodySize?: number;
    allowedMethods?: string[];
    validateCSRF?: boolean;
    validateInput?: boolean;
  } = {}
): Promise<NextResponse> {
  try {
    // Check HTTP method
    const method = request.method;
    const allowedMethods = options.allowedMethods || ["GET", "POST", "PUT", "DELETE"];
    
    if (!allowedMethods.includes(method)) {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }
    
    // Rate limiting
    if (options.rateLimit !== false) {
      const rateLimitResponse = checkAPIRateLimit(request);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    }
    
    // CSRF validation for state-changing methods
    if (options.validateCSRF !== false && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      if (!validateCSRFToken(request)) {
        return NextResponse.json(
          { error: "Invalid request origin", message: "CSRF validation failed" },
          { status: 403 }
        );
      }
    }
    
    // Content type validation (for methods with body)
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const contentTypeResponse = validateContentType(request);
      if (contentTypeResponse) {
        return contentTypeResponse;
      }
    }
    
    // Body size validation
    let body = null;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const bodyText = await request.text();
      const bodySizeResponse = validateBodySize(bodyText, options.maxBodySize);
      if (!bodySizeResponse.valid && bodySizeResponse.response) {
        return bodySizeResponse.response;
      }
      
      try {
        body = bodyText ? JSON.parse(bodyText) : null;
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid JSON" },
          { status: 400 }
        );
      }
      
      // Validate input for injection attacks
      if (options.validateInput !== false && body) {
        const securityCheck = validateRequestSecurity(body);
        if (!securityCheck.valid) {
          console.warn("[SECURITY] Potential injection attack detected:", securityCheck.errors);
          return NextResponse.json(
            { error: "Invalid input", message: "Request contains potentially dangerous content" },
            { status: 400 }
          );
        }
      }
    }
    
    // Authentication
    let contractor: Contractor | null = null;
    if (options.requireAuth) {
      const authResult = await requireAuth();
      if (authResult.response) {
        return authResult.response;
      }
      contractor = authResult.contractor;
    }
    
    // Execute handler
    const result = await handler(contractor, body);
    
    return NextResponse.json(result);
  } catch (error) {
    return createSecureErrorResponse("Request processing failed", 500, error);
  }
}




