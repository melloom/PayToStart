import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, LogOut, Plus, Clock } from "lucide-react";
import type { Metadata } from "next";
import { getTrialInfo } from "@/lib/subscriptions";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your contracts, templates, and payments from your Pay2Start dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contractor = await getCurrentContractor();

  if (!contractor) {
    redirect("/login");
  }

  // Check if we're already on the select-plan page to avoid redirect loops
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isSelectPlanPage = pathname === "/dashboard/select-plan";

  // Check if user has selected a plan - MUST be explicitly true to access dashboard
  // Skip plan check if we're already on the select-plan page to prevent loops
  if (!isSelectPlanPage) {
    try {
      const company = await db.companies.findById(contractor.companyId);
      // Redirect if company not found OR plan not explicitly selected (planSelected !== true)
      if (!company || company.planSelected !== true) {
        // Redirect to plan selection if they haven't selected a plan yet
        redirect("/dashboard/select-plan");
      }
    } catch (error) {
      console.error("Error fetching company for plan check:", error);
      // If we can't fetch company, redirect to plan selection for security
      // This ensures plan selection is required even if there's a database error
      redirect("/dashboard/select-plan");
    }
  }

  // Get trial information
  const trialInfo = await getTrialInfo(contractor.companyId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Trial Banner */}
      {trialInfo?.isInTrial && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5" />
                <div>
                  <span className="font-semibold">
                    {trialInfo.daysRemaining === 0 
                      ? "Trial ends today!" 
                      : trialInfo.daysRemaining === 1
                      ? "1 day left in your free trial"
                      : `${trialInfo.daysRemaining} days left in your free trial`}
                  </span>
                  <span className="ml-2 text-indigo-100">
                    Upgrade to continue using all features
                  </span>
                </div>
              </div>
              <Link href="/pricing">
                <Button 
                  size="sm" 
                  className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold"
                >
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2 group">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg group-hover:shadow-xl transition-shadow">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Pay2Start
                </span>
              </Link>
              <nav className="hidden md:flex items-center space-x-1">
                <Link 
                  href="/dashboard" 
                  prefetch={true}
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/contracts" 
                  prefetch={true}
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
                >
                  Contracts
                </Link>
                <Link 
                  href="/dashboard/templates" 
                  prefetch={true}
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
                >
                  Templates
                </Link>
                <Link 
                  href="/dashboard/subscription" 
                  prefetch={true}
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
                >
                  Subscription
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                  {contractor.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-300">
                  {contractor.name}
                </span>
              </div>
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="ghost" size="icon" className="hover:bg-slate-800 text-slate-300 hover:text-white">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <div className="min-h-[calc(100vh-4rem)]">
        {children}
      </div>
    </div>
  );
}

