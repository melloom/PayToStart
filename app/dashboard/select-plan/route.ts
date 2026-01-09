// Route handler to handle POST requests to /dashboard/select-plan
// This ensures that POST redirects are converted to GET requests
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // Convert POST to GET by redirecting with 303 status to the same URL
  const url = new URL("/dashboard/select-plan", request.url);
  return NextResponse.redirect(url, { status: 303 });
}

