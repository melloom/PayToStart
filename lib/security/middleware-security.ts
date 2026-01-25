// Security utilities for middleware (Edge runtime compatible)
// This file only contains functions that don't require browser APIs

import { NextRequest } from "next/server";

/**
 * Get client IP address from request
 * Edge runtime compatible
 */
export function getClientIP(request: NextRequest | Request): string {
  // Check various headers for real IP (behind proxy/load balancer)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback to connection remote address (if available)
  return "unknown";
}
