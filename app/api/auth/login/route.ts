import { NextResponse } from "next/server";
import { signIn, signInWithMagicLink } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, method } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Magic link login
    if (method === "magic_link") {
      const result = await signInWithMagicLink(email);
      if (result.error) {
        return NextResponse.json(
          { message: result.error },
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
        { message: "Password is required" },
        { status: 400 }
      );
    }

    const result = await signIn(email, password);

    if (result.error) {
      return NextResponse.json(
        { message: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
