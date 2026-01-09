import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getClientIP } from "@/lib/security/api-security";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/_next/webpack") ||
    pathname.startsWith("/api/") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|ico)$/)
  ) {
    return NextResponse.next();
  }
  
  // Security: Block suspicious requests early
  const userAgent = request.headers.get("user-agent") || "";
  const ip = getClientIP(request);
  
  // Block common attack patterns in user agent
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /masscan/i,
    /nmap/i,
    /\.\./, // Path traversal
    /<script/i, // XSS attempts
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious) {
    console.warn(`[SECURITY] Suspicious request blocked: IP=${ip}, UA=${userAgent.substring(0, 100)}`);
    return new NextResponse("Forbidden", { status: 403 });
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|_next/webpack|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)$).*)",
  ],
};
