import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkAPIRateLimit, getClientIP } from "@/lib/security/api-security";

/**
 * API endpoint to get client IP address
 * Used for signature tracking and security purposes
 */
export async function GET(request: Request) {
  try {
    // Rate limiting to prevent abuse
    const rateLimitResponse = checkAPIRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const ip = getClientIP(request);

    // Security: Only return IP, no other information
    return NextResponse.json({ ip });
  } catch (error) {
    // Security: Don't leak error details
    return NextResponse.json({ ip: "unknown" }, { status: 500 });
  }
}

