import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  try {
    await signOut();
    
    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    // Even if there's an error, try to redirect
    return NextResponse.json(
      { error: "Logout failed", message: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
