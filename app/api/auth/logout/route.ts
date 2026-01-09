import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await signOut();
    
    // Redirect to landing page after successful logout
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Logout error:", error);
    // Even if there's an error, redirect to landing page
    return NextResponse.redirect(new URL("/", request.url));
  }
}
