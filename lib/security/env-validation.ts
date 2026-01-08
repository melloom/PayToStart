// Environment variable validation and security checks

/**
 * Validate required environment variables are set
 * Throws error if any required variables are missing
 */
export function validateEnvironmentVariables(): void {
  const requiredVars = {
    // Supabase (required)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    
    // Stripe (required for payments)
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    
    // App URL (required)
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    
    // Signing token secret (required for security)
    SIGNING_TOKEN_SECRET: process.env.SIGNING_TOKEN_SECRET,
  };
  
  const missing: string[] = [];
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value || value.trim() === "") {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      "Please check your .env.local file and ensure all required variables are set."
    );
  }
  
  // Security checks
  if (process.env.NODE_ENV === "production") {
    // Production-specific checks
    if (process.env.SIGNING_TOKEN_SECRET === "change-me-in-production-very-secure-secret-key" ||
        process.env.SIGNING_TOKEN_SECRET === "your-secret-key-change-in-production" ||
        !process.env.SIGNING_TOKEN_SECRET ||
        process.env.SIGNING_TOKEN_SECRET.length < 32) {
      throw new Error(
        "SIGNING_TOKEN_SECRET must be set to a secure random string (32+ characters) in production"
      );
    }
    
    if (process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
      console.warn("⚠️  WARNING: Using Stripe test keys in production!");
    }
    
    if (process.env.NEXT_PUBLIC_APP_URL?.includes("localhost")) {
      console.warn("⚠️  WARNING: NEXT_PUBLIC_APP_URL points to localhost in production!");
    }
  }
}

/**
 * Validate environment variables on app startup
 * Call this early in your application lifecycle
 */
if (typeof window === "undefined") {
  // Only validate on server-side
  try {
    validateEnvironmentVariables();
  } catch (error) {
    console.error("❌ Environment validation failed:", error instanceof Error ? error.message : String(error));
    // Don't throw in development to allow local setup
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }
}

