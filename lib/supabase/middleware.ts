import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables in middleware");
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Ensure proper cookie options for session persistence
          // Use Supabase's maxAge if provided, otherwise set to 1 year for persistence
          // Supabase will handle token refresh automatically via getUser() calls
          const cookieOptions: CookieOptions = {
            ...options,
            path: options.path || "/",
            sameSite: options.sameSite || "lax",
            httpOnly: options.httpOnly ?? true,
            secure: options.secure ?? (process.env.NODE_ENV === "production"),
            // Set maxAge for persistent cookies
            // If Supabase provides maxAge, use it; otherwise default to 1 year
            // This ensures cookies persist across browser sessions
            maxAge: options.maxAge ?? 60 * 60 * 24 * 365, // 1 year in seconds (fallback)
          };

          request.cookies.set({
            name,
            value,
            ...cookieOptions,
          });
          
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          
          supabaseResponse.cookies.set({
            name,
            value,
            ...cookieOptions,
          });
        },
        remove(name: string, options: CookieOptions) {
          const cookieOptions: CookieOptions = {
            ...options,
            path: options.path || "/",
            sameSite: options.sameSite || "lax",
            httpOnly: options.httpOnly ?? true,
            secure: options.secure ?? (process.env.NODE_ENV === "production"),
          };

          request.cookies.set({
            name,
            value: "",
            ...cookieOptions,
          });
          
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          
          supabaseResponse.cookies.set({
            name,
            value: "",
            ...cookieOptions,
          });
        },
      },
    }
  );

  // Refresh session if expired - this ensures the session is valid and cookies are updated
  // The getUser() call will automatically refresh the session token if it's expired
  // and update the cookies via the set() method above
  await supabase.auth.getUser();

  return supabaseResponse;
}

