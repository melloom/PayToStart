"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Lock, Building2, ArrowLeft, CreditCard, CheckCircle2, Sparkles } from "lucide-react";
import { TIER_CONFIG, type SubscriptionTier } from "@/lib/types";
import { motion } from "framer-motion";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .refine((val) => /[A-Za-z]/.test(val), {
      message: "Password must contain at least one letter",
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one number",
    }),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
});

type SignupForm = z.infer<typeof signupSchema>;

const PLANS = [
  {
    id: "free" as const,
    name: "7-Day Free Trial",
    description: "Try Starter features for 7 days",
    price: 0,
    originalPrice: 29,
    badge: "Most Popular",
    features: ["7 days free", "All Starter features", "No credit card required"],
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "starter" as const,
    name: "Starter",
    description: "Start immediately with Starter",
    price: 29,
    badge: null,
    features: ["Start immediately", "All Starter features", "Cancel anytime"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "pro" as const,
    name: "Pro",
    description: "Start immediately with Pro",
    price: 79,
    badge: "Best Value",
    features: ["Start immediately", "All Pro features", "Cancel anytime"],
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "premium" as const,
    name: "Premium",
    description: "Start immediately with Premium",
    price: 149,
    badge: null,
    features: ["Start immediately", "All Premium features", "Cancel anytime"],
    color: "from-orange-500 to-red-500",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | "free">("free");
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const handlePlanSelect = (planId: SubscriptionTier | "free") => {
    setSelectedPlan(planId);
    setShowForm(true);
  };

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const startSubscription = selectedPlan !== "free";
      
      const response = await fetch("/api/auth/signup-with-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          companyName: data.companyName,
          tier: selectedPlan,
          startSubscription: startSubscription,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error("Signup error:", {
          status: response.status,
          statusText: response.statusText,
          result,
          errorMessage: result.message,
          errors: result.errors,
        });

        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors.map((err: any) => {
            const field = err.path?.join('.') || 'field';
            return `${field}: ${err.message}`;
          }).join(', ');
          
          toast({
            title: "Validation failed",
            description: errorMessages || result.message || "Please check your input and try again.",
            variant: "destructive",
          });
        } else if (response.status === 409) {
          toast({
            title: "Email already exists",
            description: result.message || "An account with this email already exists.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: result.message || "Something went wrong. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // If subscription checkout URL is provided, redirect to Stripe
      if (result.checkoutUrl) {
        toast({
          title: "Account created!",
          description: "Redirecting to payment...",
        });
        window.location.href = result.checkoutUrl;
        return;
      }

      // Free tier or trial
      const message = result.needsEmailConfirmation
        ? "Please check your email to verify your account."
        : selectedPlan === "free"
        ? "Account created! Your 7-day free trial starts now."
        : "Account created successfully. You can now sign in.";
      
      toast({
        title: "Account created!",
        description: message,
      });
      
      // Redirect to login or dashboard
      setTimeout(() => {
        if (result.needsEmailConfirmation) {
          router.push("/login");
        } else {
          router.push("/login");
        }
      }, 2000);
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

  if (!showForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-indigo-400 mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Start with a free trial or choose a plan that fits your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`relative cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? "scale-105"
                    : "hover:scale-102"
                }`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                <Card
                  className={`h-full border-2 transition-all duration-300 ${
                    selectedPlan === plan.id
                      ? "border-indigo-500 bg-slate-800 shadow-xl"
                      : "border-slate-700 bg-slate-800/50 hover:border-indigo-400/50"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      {plan.id === "free" ? (
                        <Sparkles className="h-6 w-6 text-white" />
                      ) : (
                        <CreditCard className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                    <CardDescription className="text-slate-400 mt-2">{plan.description}</CardDescription>
                    <div className="mt-4">
                      {plan.price === 0 ? (
                        <div>
                          <span className="text-4xl font-bold text-white">Free</span>
                          <div className="text-sm text-slate-400 line-through mt-1">
                            ${plan.originalPrice}/mo
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-4xl font-bold text-white">${plan.price}</span>
                          <span className="text-slate-400 ml-1">/month</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${
                        selectedPlan === plan.id
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                          : "bg-slate-700 hover:bg-slate-600"
                      } text-white`}
                    >
                      {selectedPlan === plan.id ? "Selected" : "Choose Plan"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 text-slate-400 text-sm">
            <p>All plans include a 7-day free trial. Cancel anytime.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">
      <Card className="w-full max-w-md border-2 border-slate-700 shadow-2xl bg-slate-800">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-400 hover:text-indigo-400"
              onClick={() => setShowForm(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Create Your Account</CardTitle>
          <CardDescription className="text-slate-400 mt-2">
            {selectedPlan === "free" 
              ? "Start your 7-day free trial - No credit card required"
              : `Sign up for ${PLANS.find(p => p.id === selectedPlan)?.name} - $${PLANS.find(p => p.id === selectedPlan)?.price}/month`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10 bg-slate-900 border-slate-700 text-white"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 bg-slate-900 border-slate-700 text-white"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Your Company"
                  className="pl-10 bg-slate-900 border-slate-700 text-white"
                  {...register("companyName")}
                />
              </div>
              {errors.companyName && (
                <p className="text-sm text-destructive">{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  className="pl-10 bg-slate-900 border-slate-700 text-white"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="pl-10 bg-slate-900 border-slate-700 text-white"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white" 
              disabled={isLoading}
            >
              {isLoading ? (
                "Creating account..."
              ) : selectedPlan === "free" ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Free Trial
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Create Account & Continue to Payment
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
