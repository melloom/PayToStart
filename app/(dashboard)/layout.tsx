import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { DashboardNav } from "@/components/navigation/dashboard-nav";
import type { Metadata } from "next";
import { getTrialInfo } from "@/lib/subscriptions";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

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

  // Get trial information and current tier
  const trialInfo = await getTrialInfo(contractor.companyId);
  const company = await db.companies.findById(contractor.companyId);
  const currentTier = company?.subscriptionTier || "free";
  const isActiveSubscription = company?.subscriptionStatus === "active" || company?.subscriptionStatus === "trialing";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Suspense fallback={<div className="h-16 bg-slate-900/95" />}>
        <DashboardNav 
          contractorName={contractor.name} 
          trialInfo={trialInfo ? {
            isInTrial: trialInfo.isInTrial,
            daysRemaining: trialInfo.daysRemaining || 0,
            trialTier: trialInfo.trialTier,
          } : null}
          currentTier={currentTier}
          isActiveSubscription={isActiveSubscription}
        />
      </Suspense>
      <div className="min-h-[calc(100vh-4rem)]">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
        {children}
        </Suspense>
      </div>
    </div>
  );
}

