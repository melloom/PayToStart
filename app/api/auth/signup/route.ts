import { NextResponse } from "next/server";
import { signUp } from "@/lib/auth";
import { checkAPIRateLimit, sanitizeEmail, sanitizeInput, validateContentType, createSecureErrorResponse, getClientIP } from "@/lib/security/api-security";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Invalid email address").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(200),
});

export async function POST(request: Request) {
  try {
    // Rate limiting for signup attempts
    const ip = getClientIP(request);
    const rateLimitResponse = checkAPIRateLimit(request, `signup:${ip}`);
    if (rateLimitResponse) {
      console.log("Rate limit exceeded for signup:", ip);
      return rateLimitResponse;
    }

    // Validate content type
    const contentTypeResponse = validateContentType(request);
    if (contentTypeResponse) {
      return contentTypeResponse;
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return NextResponse.json(
        { 
          error: "Invalid request",
          message: "Request body must be valid JSON"
        },
        { status: 400 }
      );
    }

    // Validate input
    console.log("Signup request body:", JSON.stringify(body, null, 2));
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Signup validation failed:", JSON.stringify(validationResult.error.errors, null, 2));
      return NextResponse.json(
        { 
          error: "Validation failed",
          message: "Please check your input and try again",
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { email, password, name, companyName } = validationResult.data;

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: "Invalid email", message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedCompanyName = sanitizeInput(companyName);

    console.log("Sanitized values:", {
      name: sanitizedName,
      companyName: sanitizedCompanyName,
      nameLength: sanitizedName?.length,
      companyNameLength: sanitizedCompanyName?.length,
    });

    // Validate sanitized inputs aren't empty
    if (!sanitizedName || sanitizedName.trim().length < 2) {
      console.error("Name validation failed:", { original: name, sanitized: sanitizedName, length: sanitizedName?.length });
      return NextResponse.json(
        { error: "Invalid name", message: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (!sanitizedCompanyName || sanitizedCompanyName.trim().length < 2) {
      console.error("Company name validation failed:", { original: companyName, sanitized: sanitizedCompanyName, length: sanitizedCompanyName?.length });
      return NextResponse.json(
        { error: "Invalid company name", message: "Company name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Additional password strength check
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      console.error("Password validation failed:", { passwordLength: password.length, hasLetters: /[A-Za-z]/.test(password), hasNumbers: /[0-9]/.test(password) });
      return NextResponse.json(
        { error: "Weak password", message: "Password must contain both letters and numbers" },
        { status: 400 }
      );
    }

    console.log("Calling signUp with:", {
      email: sanitizedEmail,
      name: sanitizedName,
      company_name: sanitizedCompanyName,
    });

    const result = await signUp(sanitizedEmail, password, {
      name: sanitizedName,
      company_name: sanitizedCompanyName,
    });

    console.log("SignUp result:", { 
      hasError: !!result.error, 
      error: result.error,
      hasUser: !!result.user,
      needsEmailConfirmation: result.needsEmailConfirmation,
    });

    if (result.error) {
      console.error("SignUp error:", result.error);
      // Check for specific errors
      if (result.error.includes("already registered") || result.error.includes("already exists")) {
        return NextResponse.json(
          { error: "Email exists", message: "An account with this email already exists." },
          { status: 409 }
        );
      }
      
      // Generic error message to prevent account enumeration for other errors
      return NextResponse.json(
        { error: "Signup failed", message: result.error || "Could not create account. Please try again." },
        { status: 400 }
      );
    }

    // Check if email confirmation is required
    const message = result.needsEmailConfirmation
      ? "Account created successfully. Please check your email to verify your account."
      : "Account created successfully. You can now sign in.";

    return NextResponse.json({
      success: true,
      message,
      needsEmailConfirmation: result.needsEmailConfirmation,
    });
  } catch (error) {
    return createSecureErrorResponse("Account creation failed", 500, error);
  }
}

