# Security Usage Guide

This guide shows how to use the security utilities in your API routes.

## Basic API Route Security

### Using `secureAPIHandler` (Recommended)

```typescript
import { secureAPIHandler } from "@/lib/security/api-security";
import { requireAuth } from "@/lib/security/api-security";

export async function POST(request: Request) {
  return secureAPIHandler(
    request,
    async (contractor, body) => {
      // Your handler logic here
      // contractor is guaranteed to be non-null if requireAuth is true
      if (!contractor) {
        throw new Error("Unauthorized");
      }
      
      // body is already validated and sanitized
      return { success: true, data: body };
    },
    {
      requireAuth: true,
      rateLimit: true,
      maxBodySize: 1024 * 1024, // 1MB
      allowedMethods: ["POST"],
      validateCSRF: true,
      validateInput: true,
    }
  );
}
```

### Using `applySecurityMiddleware` (More Control)

```typescript
import { applySecurityMiddleware, createSecureResponse } from "@/lib/security/middleware-helpers";
import { requireAuth } from "@/lib/security/api-security";

export async function POST(request: NextRequest) {
  // Apply security middleware
  const securityCheck = await applySecurityMiddleware(request, {
    requireAuth: true,
    rateLimit: true,
    maxBodySize: 1024 * 1024,
    validateCSRF: true,
    validateInput: true,
  });

  if (!securityCheck.allowed) {
    return securityCheck.response!;
  }

  // Check authentication separately if needed
  const authResult = await requireAuth();
  if (authResult.response) {
    return authResult.response;
  }

  // Use sanitized body
  const { body } = securityCheck;

  // Your handler logic
  return createSecureResponse({ success: true });
}
```

## Input Sanitization

### Sanitize User Input

```typescript
import { sanitizeInput, sanitizeEmail, sanitizeHTML } from "@/lib/security/api-security";

// Sanitize text input
const safeName = sanitizeInput(userInput.name);

// Sanitize email
const safeEmail = sanitizeEmail(userInput.email);
if (!safeEmail) {
  return NextResponse.json({ error: "Invalid email" }, { status: 400 });
}

// Sanitize HTML content
const safeHTML = sanitizeHTML(userInput.content, true); // true = allow basic formatting
```

### Validate for Injection Attacks

```typescript
import { validateRequestSecurity, containsSQLInjection, containsXSS } from "@/lib/security/api-security";

// Check entire request body
const securityCheck = validateRequestSecurity(requestBody);
if (!securityCheck.valid) {
  return NextResponse.json(
    { error: "Invalid input", errors: securityCheck.errors },
    { status: 400 }
  );
}

// Check specific fields
if (containsSQLInjection(userInput.search)) {
  return NextResponse.json({ error: "Invalid search query" }, { status: 400 });
}
```

## File Upload Security

```typescript
import { validateFileUpload, validateImageUpload } from "@/lib/security/file-upload";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate image upload
  const validation = validateImageUpload({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!validation.valid) {
    return NextResponse.json(
      { error: "Invalid file", errors: validation.errors },
      { status: 400 }
    );
  }

  // Use sanitized file name
  const safeFileName = validation.sanitizedFileName!;

  // Process file...
}
```

## UUID Validation

```typescript
import { validateUUID } from "@/lib/security/api-security";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Validate UUID before database query
  if (!validateUUID(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  // Safe to use in database query
  const contract = await db.contracts.findById(id);
  // ...
}
```

## Path Validation

```typescript
import { sanitizeFilePath } from "@/lib/security/api-security";

export async function GET(request: Request) {
  const filePath = request.nextUrl.searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Path required" }, { status: 400 });
  }

  const safePath = sanitizeFilePath(filePath);
  if (!safePath) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  // Safe to use
  // ...
}
```

## Rate Limiting

```typescript
import { checkAPIRateLimit, getClientIP } from "@/lib/security/api-security";

export async function POST(request: Request) {
  const ip = getClientIP(request);
  
  // Custom rate limiting with identifier
  const rateLimitResponse = checkAPIRateLimit(request, `custom:${ip}`);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Your handler logic
}
```

## CSRF Protection

CSRF protection is automatically enabled in `secureAPIHandler` and `applySecurityMiddleware` for state-changing methods (POST, PUT, PATCH, DELETE).

For manual validation:

```typescript
import { validateCSRFToken } from "@/lib/security/api-security";

export async function POST(request: Request) {
  if (!validateCSRFToken(request)) {
    return NextResponse.json(
      { error: "CSRF validation failed" },
      { status: 403 }
    );
  }

  // Your handler logic
}
```

## Error Handling

```typescript
import { createSecureErrorResponse } from "@/lib/security/api-security";

export async function POST(request: Request) {
  try {
    // Your logic
  } catch (error) {
    // Secure error response (no sensitive info leaked)
    return createSecureErrorResponse("Operation failed", 500, error);
  }
}
```

## Best Practices

1. **Always validate input**: Use Zod schemas + security validation
2. **Sanitize before storing**: Sanitize all user inputs before database operations
3. **Use parameterized queries**: Supabase does this automatically, but validate UUIDs
4. **Enable rate limiting**: Especially for authentication and public endpoints
5. **Validate file uploads**: Always validate file type, size, and content
6. **Use secure error responses**: Never expose internal errors to clients
7. **Enable CSRF protection**: For all state-changing operations
8. **Log security events**: Monitor for attack patterns

## Security Checklist for New API Routes

- [x] Input validation with Zod
- [x] Input sanitization
- [x] Injection attack detection
- [x] Rate limiting enabled
- [x] CSRF protection (for POST/PUT/PATCH/DELETE)
- [x] Authentication check (if required)
- [x] Body size validation
- [x] Content type validation
- [x] Secure error handling
- [x] UUID validation (if using UUIDs)
- [x] File validation (if handling files)
