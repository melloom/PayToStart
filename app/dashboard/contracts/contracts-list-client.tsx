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
    const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; className?: string }> = {
      draft: { variant: "outline", className: "bg-slate-100 text-slate-700 border-slate-300" },
      sent: { variant: "secondary", className: "bg-amber-100 text-amber-700 border-amber-300" },
      signed: { variant: "default", className: "bg-green-100 text-green-700 border-green-300" },
      paid: { variant: "default", className: "bg-blue-100 text-blue-700 border-blue-300" },
      completed: { variant: "default", className: "bg-purple-100 text-purple-700 border-purple-300" },
      cancelled: { variant: "destructive", className: "bg-red-100 text-red-700 border-red-300" },
    };

    const config = statusConfig[status] || { variant: "outline", className: "" };

    return (
      <Badge variant={config.variant} className={config.className}>
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
    <Card className="border-2 border-slate-200 shadow-lg bg-white">
      <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <CardTitle className="text-2xl font-bold text-slate-900 mb-4">All Contracts</CardTitle>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const count = f.value === "all" ? contracts.length : contracts.filter((c) => c.status === f.value).length;
            return (
              <Button
                key={f.value}
                variant={filter === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f.value)}
                className={
                  filter === f.value
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }
              >
                {f.label} <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded text-xs font-semibold">{count}</span>
              </Button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {filter === "all" ? "No contracts yet" : `No ${filter} contracts`}
            </h3>
            <p className="text-slate-600">
              {filter === "all" 
                ? "Create your first contract to get started."
                : `You don't have any ${filter} contracts at the moment.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContracts
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((contract) => (
                <Link
                  key={contract.id}
                  href={`/dashboard/contracts/${contract.id}`}
                  prefetch={true}
                  className="block p-5 border-2 border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md bg-white transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-purple-600 transition-colors">
                          {contract.title}
                        </h3>
                        {getStatusBadge(contract.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {contract.clientName}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span>{format(contract.createdAt, "MMM d, yyyy")}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-slate-900">
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
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

