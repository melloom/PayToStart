"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, FileText } from "lucide-react";
import Link from "next/link";

function ErrorHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // Show any error passed via query param (from the API route redirects)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      toast({
        title: "Authentication error",
        description: decodeURIComponent(errorParam),
        variant: "destructive",
      });
      // Clean up URL so error doesn't persist
      router.replace("/login");
    }
  }, [searchParams, toast, router]);

  return null;
}

export default function LoginPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4">
      <Suspense fallback={null}>
        <ErrorHandler />
      </Suspense>
      <Card className="w-full max-w-md border-2 border-slate-700 shadow-2xl bg-slate-900">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-indigo-400">
                Back Home
              </Button>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
          <CardDescription className="text-slate-400 mt-2">
            Sign in to your Pay2Start account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Plain HTML form that posts directly to the login API */}
          <form method="POST" action="/api/auth/login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <Button type="submit" className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-400">
                  Or
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              asChild
            >
              <Link href="/signup">
                <Mail className="h-4 w-4 mr-2" />
                Sign up with email
              </Link>
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-indigo-400 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}


