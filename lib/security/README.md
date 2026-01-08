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

### 4. Environment Validation (`env-validation.ts`)
- **Required variable checks**: Validates all required env vars are set
- **Production security checks**: Ensures secure configuration in production
- **Secret validation**: Checks token secrets are properly configured

### 5. Middleware Security (`middleware.ts`)
- **Suspicious request blocking**: Blocks known attack patterns
- **Security headers**: Adds security headers to all responses
- **Session management**: Handles Supabase session securely

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


