import { getCurrentContractor } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, LogOut } from "lucide-react";
import { PublicNav } from "@/components/navigation/public-nav";

export default async function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const contractor = await getCurrentContractor();
  const isAuthenticated = !!contractor;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Conditional Navigation - Dashboard Nav for authenticated users */}
      {isAuthenticated ? (
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
                  <Link 
                    href="/pricing" 
                    prefetch={true}
                    className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg"
                  >
                    Pricing
                  </Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                {contractor && (
                  <div className="hidden sm:flex items-center space-x-3 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                      {contractor.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-300">
                      {contractor.name}
                    </span>
                  </div>
                )}
                <form action="/api/auth/logout" method="POST">
                  <Button type="submit" variant="ghost" size="icon" className="hover:bg-slate-800 text-slate-300 hover:text-white">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </nav>
      ) : (
        <PublicNav />
      )}
      {children}
    </div>
  );
}
