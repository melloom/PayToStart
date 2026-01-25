import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getClientIP } from "@/lib/security/middleware-security";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static assets and API routes
  // This must be done BEFORE any processing to avoid interfering with Next.js asset serving
  if (
    pathname.startsWith("/_next/") || // All Next.js internal paths
    pathname.startsWith("/api/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|ico|css|js|json|map)$/i)
  ) {
    return NextResponse.next();
  }
  
  // Security: Block suspicious requests early
  const userAgent = request.headers.get("user-agent") || "";
  const ip = getClientIP(request);
  const url = request.nextUrl.pathname + request.nextUrl.search;
  
  // Block common attack patterns in user agent
  const suspiciousUserAgentPatterns = [
    /sqlmap/i,
    /nikto/i,
    /masscan/i,
    /nmap/i,
    /burp/i,
    /acunetix/i,
    /nessus/i,
    /openvas/i,
    /w3af/i,
    /\.\./, // Path traversal
    /<script/i, // XSS attempts
  ];
  
  // Block suspicious patterns in URL
  const suspiciousURLPatterns = [
    /\.\./, // Path traversal
    /\.\.%2F/i, // URL encoded path traversal
    /\.\.%5C/i, // URL encoded backslash path traversal
    /<script/i, // XSS attempts
    /javascript:/i, // JavaScript protocol
    /data:text\/html/i, // Data URI XSS
    /union.*select/i, // SQL injection
    /or.*1.*=.*1/i, // SQL injection
    /exec\(/i, // Command injection
    /system\(/i, // Command injection
    /eval\(/i, // Code injection
    /\.\.\/\.\.\/etc\/passwd/i, // Path traversal to sensitive files
    /\.\.\/\.\.\/windows\/system32/i, // Windows path traversal
    /phpinfo/i, // PHP info disclosure
    /\.env/i, // Environment file access
    /\.git/i, // Git directory access
    /\.svn/i, // SVN directory access
    /\.htaccess/i, // Apache config access
    /wp-admin/i, // WordPress admin (if not using WordPress)
    /wp-login/i, // WordPress login (if not using WordPress)
    /\.\.\/\.\.\/\.\.\/\.\./i, // Multiple path traversals
  ];
  
  const isSuspiciousUA = suspiciousUserAgentPatterns.some(pattern => pattern.test(userAgent));
  const isSuspiciousURL = suspiciousURLPatterns.some(pattern => pattern.test(url));
  
  if (isSuspiciousUA || isSuspiciousURL) {
    console.warn(`[SECURITY] Suspicious request blocked: IP=${ip}, UA=${userAgent.substring(0, 100)}, URL=${url.substring(0, 200)}`);
    return new NextResponse("Forbidden", { status: 403 });
  }
  
  // Validate Origin header for API routes (CSRF protection)
  if (pathname.startsWith("/api/") && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const host = request.headers.get("host");
    
    // In production, validate origin
    if (process.env.NODE_ENV === "production" && host) {
      const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || `https://${host}`;
      
      // Allow requests from same origin or no origin (same-origin requests)
      if (origin && !origin.startsWith(expectedOrigin)) {
        console.warn(`[SECURITY] Invalid origin blocked: IP=${ip}, Origin=${origin}, Expected=${expectedOrigin}`);
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }
  
  // Update Supabase session - this handles auth cookie management
  const response = await updateSession(request);
  
  // Add security headers to all responses
  // If updateSession returns a response, use it; otherwise create a new one
  const finalResponse = response || NextResponse.next();
  const headers = new Headers(finalResponse.headers);
  
  // Add pathname header so server components can check the current path
  headers.set("x-pathname", pathname);
  
  // Additional security headers (but preserve content-type for static assets)
  const contentType = finalResponse.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }
  
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  // Content-Security-Policy (only for non-static paths)
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.stripe.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "media-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    // Only upgrade to HTTPS in production, not in local development
    ...(process.env.NODE_ENV === 'production' ? ["upgrade-insecure-requests"] : [])
  ];
  headers.set("Content-Security-Policy", cspDirectives.join('; '));
  
  // HSTS for HTTPS
  if (request.nextUrl.protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  
  // Create new response with security headers but preserve cookies from original response
  const newResponse = new NextResponse(finalResponse.body, {
    status: finalResponse.status,
    statusText: finalResponse.statusText,
    headers,
  });
  
  // Copy all cookies from the original response to preserve session cookies
  if (response) {
    response.cookies.getAll().forEach((cookie) => {
      newResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        sameSite: cookie.sameSite as "strict" | "lax" | "none" | undefined,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
      });
    });
  }
  
  return newResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/ (all Next.js internal paths including static, chunks, etc.)
     * - favicon.ico (favicon file)
     * - api routes (handled separately)
     * - static file extensions
     */
    "/((?!_next/|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|ico|css|js|json|map)$).*)",
  ],
};
