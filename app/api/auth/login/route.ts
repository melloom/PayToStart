import { NextResponse } from "next/server";
import { signIn, signInWithMagicLink } from "@/lib/auth";
import { checkAPIRateLimit, sanitizeEmail, createSecureErrorResponse, getClientIP } from "@/lib/security/api-security";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    // Rate limiting for login attempts
    const ip = getClientIP(request);
    const rateLimitResponse = checkAPIRateLimit(request, `login:${ip}`);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Support both JSON (if called via fetch) and form-encoded (HTML form POST)
    const contentType = request.headers.get("content-type") || "";
    let body: any;

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      body = {};
    }
    
    // Validate and sanitize input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      const message = "Invalid email or password";
      const url = new URL(request.url);
      url.pathname = "/login";
      url.searchParams.set("error", encodeURIComponent(message));
      return NextResponse.redirect(url);
    }

    const { email, password } = validationResult.data;

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      const message = "Please provide a valid email address";
      const url = new URL(request.url);
      url.pathname = "/login";
      url.searchParams.set("error", encodeURIComponent(message));
      return NextResponse.redirect(url);
    }

    // Rate limiting: Check specifically for failed login attempts
    const authResult = await signIn(sanitizedEmail, password);

    if (authResult.error) {
      // Check for email confirmation error specifically
      if (authResult.error.includes("verify your email")) {
        const url = new URL(request.url);
        url.pathname = "/login";
        url.searchParams.set("error", encodeURIComponent(authResult.error));
        return NextResponse.redirect(url);
      }
      
      // Generic error message to prevent email enumeration for other errors
      const message = "Invalid email or password";
      const url = new URL(request.url);
      url.pathname = "/login";
      url.searchParams.set("error", encodeURIComponent(message));
      return NextResponse.redirect(url);
    }

    if (!authResult.user) {
      const message = "Invalid email or password";
      const url = new URL(request.url);
      url.pathname = "/login";
      url.searchParams.set("error", encodeURIComponent(message));
      return NextResponse.redirect(url);
    }

    // Successful login - redirect to dashboard so middleware + server components see the session
    const url = new URL(request.url);
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  } catch (error) {
    return createSecureErrorResponse("Authentication failed", 500, error);
  }
}
