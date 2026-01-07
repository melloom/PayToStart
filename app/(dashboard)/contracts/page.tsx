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

  // Get clients for all contracts
  const contractsWithClients = await Promise.all(
    contracts.map(async (contract) => {
      const client = await db.clients.findById(contract.clientId);
      return { contract, client };
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your contracts
          </p>
        </div>
        <Link href="/dashboard/contracts/new">
          <Button>
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

