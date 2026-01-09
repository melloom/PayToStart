// Separate layout for select-plan page to bypass plan selection check
// This allows users to access the plan selection page even if they haven't selected a plan yet
// Minimal header with only logout and name - no navigation to prevent users from leaving

import { getCurrentContractor } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default async function SelectPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contractor = await getCurrentContractor();

  if (!contractor) {
    redirect("/login");
  }

  // Minimal header - only logout and name, no navigation
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Minimal Header - Only Logout and Name */}
      <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title - No link to prevent navigation */}
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Pay2Start
              </span>
            </div>
            
            {/* Right side - Name and Logout only */}
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

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}

