// API security utilities and middleware helpers

import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { checkRateLimit } from "./rate-limit";
import type { Contractor } from "@/lib/types";

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
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
}

/**
 * Sanitize HTML content (basic - use DOMPurify in production)
 */
export function sanitizeHTML(html: string): string {
  // Basic sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
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

