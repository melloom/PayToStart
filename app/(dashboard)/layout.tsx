import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, LogOut, Plus } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contractor = await getCurrentContractor();

  if (!contractor) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <FileText className="h-6 w-6" />
                <span className="font-semibold text-xl">Contract Manager</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-4">
                <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
                <Link href="/dashboard/contracts" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Contracts
                </Link>
                <Link href="/dashboard/templates" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Templates
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {contractor.name}
              </span>
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="ghost" size="icon">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}

