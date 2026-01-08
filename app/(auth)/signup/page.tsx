"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, FileText, User, Building2 } from "lucide-react";
import Link from "next/link";

const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Check for error query parameter (from auth callback)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      toast({
        title: "Authentication error",
        description: decodeURIComponent(errorParam),
        variant: "destructive",
      });
      // Clean up URL
      router.replace("/signup");
    }
  }, [searchParams, toast, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    // Don't send confirmPassword to the API – it's only for client-side validation
    const { confirmPassword, ...payload } = data;

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSignupSuccess(true);
        toast({
          title: "Account created!",
          description: result.message || "Please check your email to verify your account.",
        });
      } else {
        // Handle specific error cases
        if (response.status === 409) {
          toast({
            title: "Email already exists",
            description: result.message || "An account with this email already exists.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Signup failed",
            description: result.message || "Could not create account. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a verification email. Please check your inbox and click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              variant="outline"
              onClick={() => {
                setSignupSuccess(false);
              }}
              className="w-full"
            >
              Back to signup
            </Button>
            <div className="text-sm text-center text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-400 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4">
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
          <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
          <CardDescription className="text-slate-400 mt-2">
            Sign up to start managing your contracts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-slate-200">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Acme Inc."
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                {...register("companyName")}
              />
              {errors.companyName && (
                <p className="text-sm text-destructive">
                  {errors.companyName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-200">Re-enter Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                "Creating account..."
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Sign Up
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
