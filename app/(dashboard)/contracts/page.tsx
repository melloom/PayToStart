import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";
import { format } from "date-fns";
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      draft: "outline",
      sent: "secondary",
      signed: "default",
      paid: "default",
      completed: "default",
      cancelled: "outline",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Contracts</h1>
          <p className="text-slate-600 text-lg">
            Manage and track all your contracts in one place
          </p>
        </div>
        <Link href="/dashboard/contracts/new">
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all">
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </Link>
      </div>

      <ContractsListClient 
        contracts={contractsWithClients.map(({ contract, client }) => ({
          ...contract,
          clientName: client?.name || client?.email || "Unknown",
        }))}
        initialFilter={searchParams.filter}
      />
    </div>
  );
}

