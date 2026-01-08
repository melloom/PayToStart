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
          const cookieOptions: CookieOptions = {
            ...options,
            path: options.path || "/",
            sameSite: options.sameSite || "lax",
            httpOnly: options.httpOnly ?? true,
            secure: options.secure ?? (process.env.NODE_ENV === "production"),
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
  await supabase.auth.getUser();

  return supabaseResponse;
}

