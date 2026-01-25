// Security middleware helpers for API routes

import { NextRequest, NextResponse } from "next/server";
import {
  checkAPIRateLimit,
  validateContentType,
  validateBodySize,
  validateCSRFToken,
  validateRequestSecurity,
  getClientIP,
  createSecureErrorResponse,
} from "./api-security";
import { sanitizeObject } from "./validation";

export interface SecurityMiddlewareOptions {
  requireAuth?: boolean;
  rateLimit?: boolean;
  maxBodySize?: number;
  allowedMethods?: string[];
  validateCSRF?: boolean;
  validateInput?: boolean;
  allowedContentTypes?: string[];
}

/**
 * Comprehensive security middleware for API routes
 * Applies all security checks before processing requests
 */
export async function applySecurityMiddleware(
  request: NextRequest,
  options: SecurityMiddlewareOptions = {}
): Promise<{
  allowed: boolean;
  response?: NextResponse;
  body?: any;
}> {
  const {
    requireAuth = false,
    rateLimit = true,
    maxBodySize = 1024 * 1024, // 1MB default
    allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"],
    validateCSRF = true,
    validateInput = true,
    allowedContentTypes = ["application/json"],
  } = options;

  const method = request.method;
  const ip = getClientIP(request);

  // 1. Check HTTP method
  if (!allowedMethods.includes(method)) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      ),
    };
  }

  // 2. Rate limiting
  if (rateLimit) {
    const rateLimitResponse = checkAPIRateLimit(request);
    if (rateLimitResponse) {
      return {
        allowed: false,
        response: rateLimitResponse,
      };
    }
  }

  // 3. CSRF validation for state-changing methods
  if (validateCSRF && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    if (!validateCSRFToken(request)) {
      console.warn(`[SECURITY] CSRF validation failed: IP=${ip}, Method=${method}`);
      return {
        allowed: false,
        response: NextResponse.json(
          { error: "Invalid request origin", message: "CSRF validation failed" },
          { status: 403 }
        ),
      };
    }
  }

  // 4. Content type validation (for methods with body)
  if (["POST", "PUT", "PATCH"].includes(method)) {
    const contentTypeResponse = validateContentType(request, allowedContentTypes);
    if (contentTypeResponse) {
      return {
        allowed: false,
        response: contentTypeResponse,
      };
    }
  }

  // 5. Body size validation and parsing
  let body: any = null;
  if (["POST", "PUT", "PATCH"].includes(method)) {
    try {
      const bodyText = await request.text();
      
      // Validate body size
      const bodySizeResponse = validateBodySize(bodyText, maxBodySize);
      if (!bodySizeResponse.valid && bodySizeResponse.response) {
        return {
          allowed: false,
          response: bodySizeResponse.response,
        };
      }

      // Parse JSON
      if (bodyText) {
        try {
          body = JSON.parse(bodyText);
        } catch (error) {
          return {
            allowed: false,
            response: NextResponse.json(
              { error: "Invalid JSON", message: "Request body must be valid JSON" },
              { status: 400 }
            ),
          };
        }

        // Validate input for injection attacks
        if (validateInput) {
          const securityCheck = validateRequestSecurity(body);
          if (!securityCheck.valid) {
            console.warn(`[SECURITY] Potential injection attack detected: IP=${ip}, Errors=${securityCheck.errors.join(", ")}`);
            return {
              allowed: false,
              response: NextResponse.json(
                { error: "Invalid input", message: "Request contains potentially dangerous content" },
                { status: 400 }
              ),
            };
          }

          // Sanitize object recursively
          body = sanitizeObject(body);
        }
      }
    } catch (error) {
      return {
        allowed: false,
        response: createSecureErrorResponse("Failed to process request body", 400, error),
      };
    }
  }

  return {
    allowed: true,
    body,
  };
}

/**
 * Create secure response with security headers
 */
export function createSecureResponse(
  data: any,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): NextResponse {
  const response = NextResponse.json(data, { status });
  
  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Add additional headers
  Object.entries(additionalHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}
