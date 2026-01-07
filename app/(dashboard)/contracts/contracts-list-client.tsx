"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Contract } from "@/lib/types";
import { FileText } from "lucide-react";

interface ContractWithClient extends Contract {
  clientName: string;
}

type FilterType = "all" | "sent" | "signed" | "paid" | "completed" | "draft" | "cancelled";

export default function ContractsListClient({
  contracts,
  initialFilter,
}: {
  contracts: ContractWithClient[];
  initialFilter?: string;
}) {
  const [filter, setFilter] = useState<FilterType>((initialFilter as FilterType) || "all");

  const filteredContracts = useMemo(() => {
    if (filter === "all") return contracts;
    return contracts.filter((c) => c.status === filter);
  }, [contracts, filter]);

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

  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "sent", label: "Sent" },
    { value: "signed", label: "Signed" },
    { value: "paid", label: "Paid" },
    { value: "completed", label: "Completed" },
    { value: "draft", label: "Draft" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Contracts</CardTitle>
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label} ({f.value === "all" ? contracts.length : contracts.filter((c) => c.status === f.value).length})
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {filteredContracts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {filter === "all" 
                ? "No contracts yet. Create your first contract to get started."
                : `No ${filter} contracts.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContracts
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((contract) => (
                <Link
                  key={contract.id}
                  href={`/dashboard/contracts/${contract.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{contract.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Client: {contract.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {format(contract.createdAt, "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${contract.totalAmount.toFixed(2)}
                        </p>
                        {contract.depositAmount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Deposit: ${contract.depositAmount.toFixed(2)}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(contract.status)}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

