import { NextResponse } from "next/server";
import { signIn, signInWithMagicLink } from "@/lib/auth";
import { checkAPIRateLimit, sanitizeEmail, validateContentType, createSecureErrorResponse, getClientIP } from "@/lib/security/api-security";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  method: z.enum(["password", "magic_link"]).optional(),
});

export async function POST(request: Request) {
  try {
    // Rate limiting for login attempts
    const ip = getClientIP(request);
    const rateLimitResponse = checkAPIRateLimit(request, `login:${ip}`);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Validate content type
    const contentTypeResponse = validateContentType(request);
    if (contentTypeResponse) {
      return contentTypeResponse;
    }

    const body = await request.json();
    
    // Validate and sanitize input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          message: "Invalid request format",
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { email, password, method } = validationResult.data;

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: "Invalid email", message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Magic link login
    if (method === "magic_link") {
      const result = await signInWithMagicLink(sanitizedEmail);
      if (result.error) {
        // Don't leak specific error details in production
        return NextResponse.json(
          { error: "Authentication failed", message: "Could not send magic link. Please try again." },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Check your email for the magic link",
      });
    }

    // Password login
    if (!password) {
      return NextResponse.json(
        { error: "Password required", message: "Password is required for authentication" },
        { status: 400 }
      );
    }

    // Rate limiting: Check specifically for failed login attempts
    const authResult = await signIn(sanitizedEmail, password);

    if (authResult.error) {
      // Check for email confirmation error specifically
      if (authResult.error.includes("verify your email")) {
        return NextResponse.json(
          { error: "Email not verified", message: authResult.error },
          { status: 403 }
        );
      }
      
      // Generic error message to prevent email enumeration for other errors
      return NextResponse.json(
        { error: "Authentication failed", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!authResult.user) {
      return NextResponse.json(
        { error: "Authentication failed", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
      }
    });
  } catch (error) {
    return createSecureErrorResponse("Authentication failed", 500, error);
  }
}
