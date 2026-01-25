"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, LogOut, Plus } from "lucide-react";
import { useState, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
  contractorName: string;
  trialInfo?: {
    isInTrial: boolean;
    daysRemaining: number;
    trialTier?: string;
  } | null;
  currentTier?: string;
  isActiveSubscription?: boolean;
}

export function DashboardNav({ contractorName, trialInfo, currentTier = "free", isActiveSubscription = false }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  // Reset navigation state when pathname changes
  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    if (pathname === href) {
      e.preventDefault();
      return;
    }
    setNavigatingTo(href);
    startTransition(() => {
      router.push(href);
    });
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/contracts", label: "Contracts", icon: FileText },
    { href: "/dashboard/templates", label: "Templates" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  return (
    <>
      {/* Top progress bar during navigation */}
      {isPending && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-slate-900/50">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg transition-all duration-300"
            style={{
              width: "100%",
              animation: "loading 1s ease-in-out infinite"
            }}
          />
        </div>
      )}

      {/* Trial Banner - Only show for free users who are in trial */}
      {trialInfo?.isInTrial && currentTier === "free" && !isActiveSubscription && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
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
              <Link 
                href={`/dashboard/upgrade/${trialInfo?.trialTier || "starter"}`}
                prefetch={true}
              >
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
              <Link 
                href="/dashboard" 
                prefetch={true}
                className="flex items-center space-x-2 group"
                onClick={(e) => handleLinkClick("/dashboard", e)}
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg group-hover:shadow-xl transition-shadow">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Pay2Start
                </span>
              </Link>
              <nav className="hidden md:flex items-center space-x-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const isNavigatingToThis = navigatingTo === link.href;
                  const Icon = link.icon;
                  
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch={true}
                      onClick={(e) => handleLinkClick(link.href, e)}
                      className={cn(
                        "px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2",
                        isActive
                          ? "text-white bg-slate-800"
                          : isNavigatingToThis
                          ? "text-indigo-400 bg-slate-800/50"
                          : "text-slate-300 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                  {contractorName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-300">
                  {contractorName}
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
    </>
  );
}

