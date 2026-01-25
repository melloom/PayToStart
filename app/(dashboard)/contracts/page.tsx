import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText, DollarSign, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import ContractsListClient from "./contracts-list-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Contracts",
  description: "View and manage all your contracts",
};

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const contractor = await getCurrentContractor();

  if (!contractor) {
    redirect("/login");
  }

  const contracts = await db.contracts.findByContractorId(contractor.id);
  const drafts = await db.contractDrafts.findByContractorId(contractor.id);

  // Get clients for all contracts - optimize by fetching all unique client IDs at once
  const uniqueClientIds = [...new Set(contracts.map(c => c.clientId))];
  const clientsMap = new Map();
  
  // Fetch all clients in parallel
  await Promise.all(
    uniqueClientIds.map(async (clientId) => {
      const client = await db.clients.findById(clientId);
      if (client) {
        clientsMap.set(clientId, client);
      }
    })
  );

  // Map contracts with clients
  const contractsWithClients = contracts.map((contract) => ({
    contract,
    client: clientsMap.get(contract.clientId) || null,
  }));

  // Calculate statistics
  const stats = {
    total: contracts.length,
    sent: contracts.filter((c) => c.status === "sent").length,
    signed: contracts.filter((c) => c.status === "signed").length,
    paid: contracts.filter((c) => c.status === "paid").length,
    completed: contracts.filter((c) => c.status === "completed").length,
    draft: contracts.filter((c) => c.status === "draft").length,
    ready: contracts.filter((c) => c.status === "ready").length,
    totalRevenue: contracts
      .filter((c) => ["paid", "completed"].includes(c.status))
      .reduce((sum, c) => sum + c.totalAmount, 0),
    pendingRevenue: contracts
      .filter((c) => ["sent", "signed"].includes(c.status))
      .reduce((sum, c) => sum + c.totalAmount, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 flex items-center justify-center border-2 border-indigo-500/30 shadow-xl">
                  <FileText className="h-8 w-8 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-white mb-2">Contracts</h1>
                  <p className="text-slate-300 text-lg">
                    Manage all your contracts in one place
                  </p>
                </div>
              </div>
            </div>
            <Link href="/dashboard/contracts/new">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl hover:shadow-indigo-500/30 transition-all font-semibold px-8 py-7 text-base group">
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
                New Contract
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {contracts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="border-2 border-slate-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm hover:border-indigo-500/80 hover:shadow-xl transition-all rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Total Contracts</p>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-slate-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm hover:border-green-500/80 hover:shadow-xl transition-all rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 mt-1">Paid & Completed</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-slate-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm hover:border-amber-500/80 hover:shadow-xl transition-all rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-white">{stats.sent + stats.signed}</p>
                    <p className="text-xs text-slate-500 mt-1">Awaiting action</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-slate-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm hover:border-purple-500/80 hover:shadow-xl transition-all rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Pending Revenue</p>
                    <p className="text-3xl font-bold text-white">${stats.pendingRevenue.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 mt-1">In pipeline</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <ContractsListClient 
          contracts={contractsWithClients.map(({ contract, client }) => ({
            ...contract,
            clientName: client?.name || client?.email || "Unknown",
          }))}
          drafts={drafts}
          initialFilter={searchParams.filter}
        />
      </div>
    </div>
  );
}
