# Security Documentation

This directory contains security utilities and configurations for Pay2Start.

## Security Features

### 1. Token Security (`tokens.ts`)
- **Secure token generation**: Uses `crypto.randomBytes(32)` for 256-bit random tokens
- **Token hashing**: SHA-256 hashing with secret key (never store raw tokens)
- **Timing-safe comparison**: Prevents timing attacks on token verification
- **Token expiration**: Automatic expiry after 7 days (configurable)

### 2. Rate Limiting (`rate-limit.ts`)
- **In-memory rate limiting**: Tracks attempts per IP/identifier
- **Configurable limits**: 5 attempts per 15-minute window (configurable)
- **Automatic cleanup**: Expires old entries automatically

### 3. API Security (`api-security.ts`)
- **IP address extraction**: Handles proxies and load balancers
- **Rate limiting**: Prevents abuse on API endpoints
- **Input sanitization**: Removes XSS attempts and dangerous patterns
- **Body size validation**: Prevents large payload attacks
- **Content type validation**: Ensures proper request format
- **Secure error handling**: No information leakage in error messages
- **XSS Protection**: DOMPurify integration for HTML sanitization
- **SQL Injection Detection**: Pattern matching for SQL injection attempts
- **Command Injection Detection**: Pattern matching for command injection attempts
- **CSRF Protection**: Origin header validation for state-changing operations
- **Path Traversal Protection**: Validates and sanitizes file paths
- **UUID Validation**: Ensures UUIDs are properly formatted

### 4. Environment Validation (`env-validation.ts`)
- **Required variable checks**: Validates all required env vars are set
- **Production security checks**: Ensures secure configuration in production
- **Secret validation**: Checks token secrets are properly configured

### 5. Middleware Security (`middleware.ts`)
- **Suspicious request blocking**: Blocks known attack patterns (SQL injection, XSS, path traversal, etc.)
- **Security headers**: Adds security headers to all responses
- **Session management**: Handles Supabase session securely
- **CSRF validation**: Validates Origin header for API routes
- **Enhanced attack pattern detection**: Detects 20+ common attack patterns

### 6. Validation Utilities (`validation.ts`)
- **UUID validation**: Ensures proper UUID format
- **Email validation**: Strict email format checking
- **Password strength**: Validates password complexity
- **URL safety**: Validates URLs don't contain dangerous protocols
- **File name sanitization**: Prevents path traversal in file names
- **Phone number validation**: Sanitizes and validates phone numbers
- **Base64 validation**: Validates base64 encoded strings
- **JSON validation**: Validates JSON strings
- **IP address validation**: Validates IPv4 and IPv6 addresses
- **Domain validation**: Validates domain names
- **Object sanitization**: Recursively sanitizes objects

### 7. File Upload Security (`file-upload.ts`)
- **File type validation**: Validates MIME types and extensions
- **File size validation**: Prevents oversized file uploads
- **Dangerous file detection**: Blocks executable files and scripts
- **Image upload validation**: Specialized validation for images
- **Document upload validation**: Specialized validation for documents

### 8. Security Middleware Helpers (`middleware-helpers.ts`)
- **Comprehensive security middleware**: Applies all security checks in one function
- **Secure response creation**: Creates responses with security headers
- **Request validation pipeline**: Validates requests before processing

## Security Headers

The application sets the following security headers on all responses:

- `Strict-Transport-Security`: Forces HTTPS in production
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-XSS-Protection`: Enables XSS protection
- `Referrer-Policy`: Controls referrer information
- `Permissions-Policy`: Restricts browser features
- `Content-Security-Policy`: Controls resource loading

## Best Practices

### Input Validation
- Always use Zod schemas for validation
- Sanitize user inputs before storing
- Use `sanitizeInput()` and `sanitizeEmail()` utilities
- Use `validateRequestSecurity()` to check for injection attacks
- Use `sanitizeObject()` for complex nested objects
- Validate UUIDs with `validateUUID()` before database queries
- Use `sanitizeFilePath()` for file path inputs

### Error Handling
- Use `createSecureErrorResponse()` for consistent error handling
- Never expose internal errors to clients in production
- Log errors server-side for debugging

### Rate Limiting
- Apply rate limiting to authentication endpoints
- Use IP-based or user-based rate limiting as appropriate
- Monitor rate limit violations for security threats

### Token Management
- Never store raw tokens in the database
- Always hash tokens before storing
- Use timing-safe comparison for verification
- Set appropriate expiration times

## Configuration

### Environment Variables

Required for security:
- `SIGNING_TOKEN_SECRET`: 32+ character random string (REQUIRED)
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret

### Rate Limiting

Configure in `lib/security/tokens.ts`:
- `RATE_LIMIT_WINDOW_MINUTES`: Time window (default: 15)
- `MAX_ATTEMPTS_PER_WINDOW`: Max attempts (default: 5)

## Security Features Implemented

### Protection Against Common Attacks

1. **SQL Injection**: 
   - Supabase uses parameterized queries (automatic protection)
   - Additional pattern detection in `containsSQLInjection()`
   - Input sanitization removes SQL special characters

2. **XSS (Cross-Site Scripting)**:
   - DOMPurify integration for HTML sanitization
   - Pattern detection in `containsXSS()`
   - Input sanitization removes script tags and event handlers
   - Content Security Policy headers

3. **CSRF (Cross-Site Request Forgery)**:
   - Origin header validation in middleware
   - CSRF token validation in `validateCSRFToken()`
   - SameSite cookie enforcement

4. **Command Injection**:
   - Pattern detection in `containsCommandInjection()`
   - Input sanitization removes shell special characters
   - Path validation prevents command execution

5. **Path Traversal**:
   - URL pattern detection in middleware
   - File path sanitization in `sanitizeFilePath()`
   - File name sanitization in `sanitizeFileName()`

6. **File Upload Attacks**:
   - File type validation (MIME type and extension)
   - File size limits
   - Dangerous file detection (executables, scripts)
   - Specialized validators for images and documents

7. **Rate Limiting**:
   - IP-based rate limiting
   - Configurable limits per endpoint
   - Automatic cleanup of expired entries

8. **Large Payload Attacks**:
   - Body size validation
   - Request size limits
   - Configurable maximum sizes

## Production Checklist

- [ ] `SIGNING_TOKEN_SECRET` is set to secure random 32+ character string
- [ ] All environment variables are set
- [ ] Security headers are enabled (via next.config.mjs)
- [ ] Rate limiting is enabled on all API routes
- [ ] Input validation is applied to all user inputs
- [ ] Error messages don't leak sensitive information
- [ ] Database RLS policies are active
- [ ] Supabase service role key is kept secret
- [ ] Stripe webhook signature verification is enabled
- [ ] CSRF protection is enabled for state-changing operations
- [ ] File uploads are validated using `validateFileUpload()`
- [ ] All user inputs are sanitized before database operations
- [ ] Origin validation is working in production
- [ ] Security logging is enabled for attack detection




