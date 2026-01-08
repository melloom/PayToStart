import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getClientIP } from "@/lib/security/api-security";

export async function middleware(request: NextRequest) {
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
  if (response) {
    const headers = new Headers(response.headers);
    
    // Additional security headers
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("X-XSS-Protection", "1; mode=block");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    
    // HSTS for HTTPS
    if (request.nextUrl.protocol === "https:") {
      headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    }
    
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
