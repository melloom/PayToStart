import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    
    // Get IP from various headers (handles proxies/load balancers)
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const cfConnectingIp = headersList.get("cf-connecting-ip"); // Cloudflare
    
    let ip = "unknown";
    
    if (cfConnectingIp) {
      ip = cfConnectingIp;
    } else if (realIp) {
      ip = realIp;
    } else if (forwardedFor) {
      // x-forwarded-for can contain multiple IPs, take the first one
      ip = forwardedFor.split(",")[0].trim();
    } else {
      // Try to get from request URL (for development)
      const url = new URL(request.url);
      ip = url.searchParams.get("ip") || "unknown";
    }

    return NextResponse.json({ ip });
  } catch (error) {
    return NextResponse.json({ ip: "unknown" });
  }
}

