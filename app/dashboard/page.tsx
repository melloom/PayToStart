import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, CheckCircle, DollarSign } from "lucide-react";
import { format } from "date-fns";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your contract statistics and recent activity",
};

export default async function DashboardPage() {
  const contractor = await getCurrentContractor();

  if (!contractor) {
    redirect("/login");
  }

  const contracts = await db.contracts.findByContractorId(contractor.id);

  // Pre-fetch clients for recent contracts in parallel
  const recentContracts = contracts
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);
  
  const uniqueClientIds = [...new Set(recentContracts.map(c => c.clientId))];
  const clientsMap = new Map();
  
  await Promise.all(
    uniqueClientIds.map(async (clientId) => {
      const client = await db.clients.findById(clientId);
      if (client) {
        clientsMap.set(clientId, client);
      }
    })
  );

  const stats = {
    total: contracts.length,
    sent: contracts.filter((c) => c.status === "sent").length,
    signed: contracts.filter((c) => c.status === "signed").length,
    completed: contracts.filter((c) => c.status === "completed").length,
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; className?: string }> = {
      draft: { variant: "outline", className: "bg-slate-800 text-slate-300 border-slate-700" },
      sent: { variant: "secondary", className: "bg-amber-900/50 text-amber-300 border-amber-700" },
      signed: { variant: "default", className: "bg-green-900/50 text-green-300 border-green-700" },
      paid: { variant: "default", className: "bg-blue-900/50 text-blue-300 border-blue-700" },
      completed: { variant: "default", className: "bg-purple-900/50 text-purple-300 border-purple-700" },
      cancelled: { variant: "destructive", className: "bg-red-900/50 text-red-300 border-red-700" },
    };

    const config = statusConfig[status] || { variant: "outline", className: "" };

    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400 text-lg">
            Welcome back, {contractor.name}! Here&apos;s an overview of your contracts.
          </p>
        </div>
        <Link href="/dashboard/contracts/new" prefetch={true}>
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all">
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-2 border-slate-700 hover:border-indigo-500 hover:shadow-lg transition-all bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Total Contracts</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
            <p className="text-xs text-slate-400">All time</p>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-slate-700 hover:border-amber-500 hover:shadow-lg transition-all bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Pending</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{stats.sent}</div>
            <p className="text-xs text-slate-400">Awaiting signature</p>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-slate-700 hover:border-green-500 hover:shadow-lg transition-all bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Signed</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{stats.signed}</div>
            <p className="text-xs text-slate-400">Signed contracts</p>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-slate-700 hover:border-purple-500 hover:shadow-lg transition-all bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Completed</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{stats.completed}</div>
            <p className="text-xs text-slate-400">Paid & completed</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-slate-700 shadow-lg bg-slate-800">
        <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white">Recent Contracts</CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                Your latest contracts sorted by most recent
              </CardDescription>
            </div>
            <Link href="/dashboard/contracts" prefetch={true}>
              <Button variant="outline" size="sm" className="text-slate-600 hover:text-purple-600">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {contracts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-700/50 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No contracts yet</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Get started by creating your first contract. Send it to clients for signing and collect payments seamlessly.
              </p>
              <Link href="/dashboard/contracts/new" prefetch={true}>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Contract
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentContracts.map((contract) => {
                const client = clientsMap.get(contract.clientId);
                return (
                  <Link
                    key={contract.id}
                    href={`/dashboard/contracts/${contract.id}`}
                    prefetch={true}
                    className="block p-5 border-2 border-slate-700 rounded-xl hover:border-indigo-500 hover:shadow-md bg-slate-800 transition-all group"
                  >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">
                              {contract.title}
                            </h3>
                            {getStatusBadge(contract.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {client?.name || client?.email || "Unknown Client"}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span>{format(contract.createdAt, "MMM d, yyyy")}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-bold text-white">
                            ${contract.totalAmount.toFixed(2)}
                          </p>
                          {contract.depositAmount > 0 && (
                            <p className="text-xs text-slate-500 mt-1">
                              Deposit: ${contract.depositAmount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

