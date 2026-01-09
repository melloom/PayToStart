import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSignature } from "@/lib/signature";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, FileText, X, Send, Download, Clock, CheckCircle, DollarSign, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { CopyButton } from "@/components/copy-button";
import ContractActions from "./contract-actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

async function getContract(id: string, contractorId: string) {
  const contract = await db.contracts.findById(id);
  if (!contract || contract.contractorId !== contractorId) {
    return null;
  }
  return contract;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const contractor = await getCurrentContractor();
  if (!contractor) {
    return {
      title: "Contract",
      description: "View contract details",
    };
  }

  const contract = await getContract(params.id, contractor.id);
  if (!contract) {
    return {
      title: "Contract Not Found",
      description: "Contract not found",
    };
  }

  return {
    title: contract.title || "Contract",
    description: `View and manage contract: ${contract.title || "Untitled Contract"}`,
  };
}

export default async function ContractDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const contractor = await getCurrentContractor();
  if (!contractor) {
    redirect("/login");
  }

  const contract = await getContract(params.id, contractor.id);
  if (!contract) {
    redirect("/dashboard");
  }

  const client = await db.clients.findById(contract.clientId);
  const signature = await getSignature(contract.id);
  const payments = await db.payments.findByContractId(contract.id);
  const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sign/${contract.signingToken}`;

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

  // Build timeline events
  const timelineEvents = [];
  
  timelineEvents.push({
    type: "created",
    title: "Contract Created",
    date: contract.createdAt,
    icon: FileText,
    description: "Contract was created",
  });

  if (contract.status !== "draft" && contract.status !== "cancelled") {
    timelineEvents.push({
      type: "sent",
      title: "Contract Sent",
      date: contract.updatedAt >= contract.createdAt ? contract.updatedAt : contract.createdAt,
      icon: Send,
      description: "Contract was sent to client",
    });
  }

  if (contract.signedAt) {
    timelineEvents.push({
      type: "signed",
      title: "Contract Signed",
      date: contract.signedAt,
      icon: CheckCircle,
      description: signature ? `Signed by ${signature.full_name}` : "Contract was signed",
    });
  }

  if (contract.paidAt || payments.some(p => p.status === "completed")) {
    const paidDate = contract.paidAt || payments.find(p => p.status === "completed")?.completedAt || contract.updatedAt;
    timelineEvents.push({
      type: "paid",
      title: "Payment Received",
      date: paidDate instanceof Date ? paidDate : new Date(paidDate || contract.updatedAt),
      icon: DollarSign,
      description: payments.some(p => p.status === "completed") 
        ? `Payment of $${payments.find(p => p.status === "completed")?.amount.toFixed(2)} received`
        : "Payment was received",
    });
  }

  if (contract.completedAt) {
    timelineEvents.push({
      type: "completed",
      title: "Contract Completed",
      date: contract.completedAt,
      icon: FileCheck,
      description: "Contract was marked as completed",
    });
  }

  if (contract.status === "cancelled") {
    timelineEvents.push({
      type: "cancelled",
      title: "Contract Cancelled",
      date: contract.updatedAt,
      icon: X,
      description: "Contract was marked as void/cancelled",
    });
  }

  // Sort timeline by date
  timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{contract.title}</h1>
        <div className="flex items-center space-x-4">
          {getStatusBadge(contract.status)}
          <span className="text-sm text-muted-foreground">
            Created {format(contract.createdAt, "MMM d, yyyy 'at' h:mm a")}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none whitespace-pre-wrap">
                {contract.content}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Contract activity timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timelineEvents.map((event, index) => {
                  const Icon = event.icon;
                  const isLast = index === timelineEvents.length - 1;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`rounded-full p-2 ${event.type === "created" ? "bg-blue-100 text-blue-600" : event.type === "signed" || event.type === "completed" ? "bg-green-100 text-green-600" : event.type === "paid" ? "bg-yellow-100 text-yellow-600" : event.type === "cancelled" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {!isLast && <div className="w-0.5 h-full bg-gray-200 my-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">{event.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(event.date, "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{client?.name || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">{client?.email}</p>
                {client?.phone && (
                  <p className="text-sm text-muted-foreground">{client.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold">${contract.totalAmount.toFixed(2)}</span>
                </div>
                {contract.depositAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposit:</span>
                    <span className="font-semibold">${contract.depositAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {contract.status !== "cancelled" && contract.status !== "completed" && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {contract.status === "sent" && (
                  <>
                    <div className="flex items-center space-x-2 mb-4">
                      <Input
                        value={signingUrl}
                        readOnly
                        className="flex-1 text-sm"
                      />
                      <CopyButton value={signingUrl} />
                    </div>
                    <ContractActions contractId={contract.id} clientEmail={client?.email || ""} signingUrl={signingUrl} />
                  </>
                )}
                {(contract.status === "draft" || contract.status === "sent") && (
                  <form action={`/api/contracts/${contract.id}/void`} method="POST" className="w-full">
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Mark as Void
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {contract.pdfUrl && (
            <Card>
              <CardContent className="pt-6">
                <Button asChild className="w-full">
                  <a href={contract.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
