import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSignature, getAllSignatures } from "@/lib/signature";
import { getEffectiveTier } from "@/lib/subscriptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, FileText, X, Send, Download, Clock, CheckCircle, DollarSign, FileCheck, Eye, MessageSquare, Handshake } from "lucide-react";
import { format } from "date-fns";
import { CopyButton } from "@/components/copy-button";
import ContractActions from "./contract-actions";
import { ContractPreviewWrapper } from "@/components/contract-preview-wrapper";
import { ContractStatusPoller } from "@/components/contract-status-poller";
import { UpdateStyleButton } from "@/app/(dashboard)/contracts/[id]/update-style-button";
import { PasswordToggle } from "./password-toggle";
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

  // Fetch data in parallel for better performance - with error handling
  const [client, signature, allSignatures, payments, effectiveTier, company] = await Promise.all([
    db.clients.findById(contract.clientId).catch(() => null),
    getSignature(contract.id).catch(() => null),
    getAllSignatures(contract.id).catch(() => ({ clientSignature: null, contractorSignature: null })),
    db.payments.findByContractId(contract.id).catch(() => []),
    getEffectiveTier(contractor.companyId),
    db.companies.findById(contractor.companyId).catch(() => null),
  ]);
  
  const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sign/${contract.signingToken}`;
  
  // Get contractor info for preview
  const contractorInfo = {
    name: contractor.name,
    email: contractor.email,
    companyName: contractor.companyName || undefined,
    companyLogo: null, // Company logo not currently stored in Company table
    companyAddress: null, // Company address not currently stored in Company table
  };

  // Extract branding from contract fieldValues
  const currentBranding = contract.fieldValues && typeof contract.fieldValues === 'object' && '_branding' in contract.fieldValues
    ? (contract.fieldValues._branding as any)
    : undefined;

  // Check if user can update style (starter+ tier and is contract creator)
  const canUpdateStyle = (effectiveTier === "starter" || effectiveTier === "pro" || effectiveTier === "premium") 
    && contract.contractorId === contractor.id;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      draft: "outline",
      ready: "default",
      sent: "secondary",
      signed: "default",
      paid: "default",
      completed: "default",
      cancelled: "outline",
    };

    const displayText: Record<string, string> = {
      draft: "Draft",
      ready: "Ready to Send",
      sent: "Pending",
      signed: "Signed",
      paid: "Paid",
      completed: "Completed",
      cancelled: "Cancelled",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {displayText[status] || status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Fetch contract events from audit log
  const contractEvents = await db.contractEvents.findByContractId(contract.id);

  // Build timeline events from contract events
  const timelineEvents = [];
  
  // Always show created event
  timelineEvents.push({
    type: "created",
    title: "Contract Created",
    date: contract.createdAt,
    icon: FileText,
    description: "Contract was created",
  });

  // Add "sent" event if it exists in contract events
  const sentEvent = contractEvents.find(e => e.eventType === "sent");
  if (sentEvent) {
    timelineEvents.push({
      type: "sent",
      title: "Contract Sent",
      date: sentEvent.createdAt,
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full" style={{ maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      {/* Real-time status poller for live updates */}
      {contract.status === "sent" && (
        <ContractStatusPoller contractId={contract.id} />
      )}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 break-words">{contract.title}</h1>
        <div className="flex items-center space-x-4 flex-wrap gap-2">
          {getStatusBadge(contract.status)}
          <span className="text-sm text-muted-foreground">
            Created {format(contract.createdAt, "MMM d, yyyy 'at' h:mm a")}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6 w-full" style={{ maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
        <div className="lg:col-span-2 space-y-6" style={{ minWidth: 0, maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
          {/* Contract Preview Section */}
          <Card className="shadow-lg w-full overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Contract Preview
                </CardTitle>
                <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800">
                  How it will look on paper
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 w-full overflow-hidden">
              <div className="border-2 border-gray-200 dark:border-slate-700 rounded-b-lg overflow-hidden bg-white dark:bg-slate-950 p-6 max-h-[800px] overflow-y-auto overflow-x-hidden custom-scrollbar w-full">
                <div className="w-full min-w-0">
                  <ContractPreviewWrapper
                    contract={contract}
                    client={client || { name: "Client", email: "" }}
                    contractor={contractorInfo}
                    initialClientSignature={allSignatures.clientSignature}
                    initialContractorSignature={allSignatures.contractorSignature}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg w-full overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b">
              <CardTitle className="text-xl">Timeline</CardTitle>
              <CardDescription>Contract activity timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 w-full">
                {timelineEvents.map((event, index) => {
                  const Icon = event.icon;
                  const isLast = index === timelineEvents.length - 1;
                  return (
                    <div key={index} className="flex gap-4 w-full min-w-0">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`rounded-full p-2 ${event.type === "created" ? "bg-blue-100 text-blue-600" : event.type === "signed" || event.type === "completed" ? "bg-green-100 text-green-600" : event.type === "paid" ? "bg-yellow-100 text-yellow-600" : event.type === "cancelled" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {!isLast && <div className="w-0.5 h-full bg-gray-200 my-2" />}
                      </div>
                      <div className="flex-1 pb-4 min-w-0">
                        <div className="font-medium break-words">{event.title}</div>
                        <div className="text-sm text-muted-foreground break-words">{event.description}</div>
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

        <div className="space-y-6 min-w-0 w-full">
          <Card className="w-full overflow-hidden">
            <CardHeader>
              <CardTitle className="break-words">Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 break-words">
                <p className="font-medium break-words">{client?.name || "Unknown"}</p>
                <p className="text-sm text-muted-foreground break-all">{client?.email}</p>
                {client?.phone && (
                  <p className="text-sm text-muted-foreground break-all">{client.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg w-full overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b">
              <CardTitle className="text-xl break-words">Financial Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Show contract type badge */}
                {contract.fieldValues?.contractType === "proposal" && (
                  <div className="mb-2">
                    <Badge variant="outline" className="border-indigo-600 text-indigo-300 bg-indigo-900/20">
                      <Handshake className="h-3 w-3 mr-1" />
                      Proposal Contract
                    </Badge>
                  </div>
                )}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">
                    {contract.fieldValues?.contractType === "proposal" ? "Total Compensation:" : "Total Amount:"}
                  </span>
                  <span className="font-semibold whitespace-nowrap">${contract.totalAmount.toFixed(2)}</span>
                </div>
                {contract.depositAmount > 0 && (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground">
                      {contract.fieldValues?.contractType === "proposal" ? "Initial Payment:" : "Deposit:"}
                    </span>
                    <span className="font-semibold whitespace-nowrap">${contract.depositAmount.toFixed(2)}</span>
                  </div>
                )}
                
                {/* Payment Status */}
                {payments && payments.length > 0 && (
                  <>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center gap-2 mb-2">
                        <span className="text-muted-foreground text-sm">Payment Status:</span>
                        <Badge variant={payments.some(p => p.status === "completed") ? "default" : "secondary"}>
                          {payments.some(p => p.status === "completed") ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                      {payments.some(p => p.status === "completed") && (
                        <div className="space-y-1">
                          {payments
                            .filter(p => p.status === "completed")
                            .map((payment, idx) => (
                              <div key={payment.id} className="flex justify-between items-center gap-2 text-sm">
                                <span className="text-muted-foreground">
                                  Paid: ${(typeof payment.amount === 'number' ? payment.amount : parseFloat(payment.amount || 0)).toFixed(2)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {payment.completedAt 
                                    ? format(new Date(payment.completedAt instanceof Date ? payment.completedAt : new Date(payment.completedAt)), "MMM d, yyyy")
                                    : "Completed"
                                  }
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Remaining Balance */}
                    {contract.totalAmount > 0 && (
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-muted-foreground text-sm">Remaining Balance:</span>
                          <span className="font-semibold text-lg whitespace-nowrap">
                            ${(contract.totalAmount - (payments
                              .filter(p => p.status === "completed")
                              .reduce((sum, p) => sum + (typeof p.amount === 'number' ? p.amount : parseFloat(p.amount || 0)), 0)
                            )).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {contract.status !== "cancelled" && contract.status !== "completed" && (
            <Card className="shadow-lg w-full overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b">
                <CardTitle className="text-xl">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 w-full">
                {/* Signing URL - show for sent, signed, paid statuses */}
                {(contract.status === "sent" || contract.status === "signed" || contract.status === "paid") && signingUrl && (
                  <div className="flex items-center space-x-2 mb-4 w-full min-w-0">
                    <Input
                      value={signingUrl}
                      readOnly
                      className="flex-1 text-sm min-w-0"
                    />
                    <CopyButton value={signingUrl} />
                  </div>
                )}
                
                {/* Contract Actions - show for all statuses except cancelled/completed */}
                <div className="w-full">
                  <ContractActions 
                    contractId={contract.id} 
                    clientEmail={client?.email || ""} 
                    signingUrl={signingUrl}
                    contractStatus={contract.status}
                    hasClientSignature={!!allSignatures.clientSignature}
                    hasContractorSignature={!!allSignatures.contractorSignature}
                    depositAmount={contract.depositAmount}
                    totalAmount={contract.totalAmount}
                  />
                </div>
                
                {/* Email Client - show for sent, signed, paid statuses */}
                {(contract.status === "sent" || contract.status === "signed" || contract.status === "paid") && client?.email && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <a href={`mailto:${client.email}?subject=Contract Signing&body=Please sign the contract at: ${signingUrl || ''}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email Client
                    </a>
                  </Button>
                )}
                
                {/* Void Contract - show for draft, ready, sent statuses */}
                {(contract.status === "draft" || contract.status === "ready" || contract.status === "sent") && (
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
                
                {/* Style and Password Settings - show for all statuses */}
                <div className="w-full pt-2 mt-2">
                  <UpdateStyleButton
                    contractId={contract.id}
                    currentBranding={currentBranding}
                    contractTitle={contract.title}
                    effectiveTier={effectiveTier}
                  />
                  <PasswordToggle
                    contractId={contract.id}
                    hasPassword={!!contract.passwordHash}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {contract.pdfUrl && (
            <Card className="border-2 border-blue-100 shadow-lg w-full overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 break-words">Download Contract</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Get a professional PDF copy of your contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  asChild 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold h-11"
                >
                  <a href={contract.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-5 w-5 mr-2" />
                    Download PDF
                  </a>
                </Button>
                {canUpdateStyle && (
                  <UpdateStyleButton
                    contractId={contract.id}
                    currentBranding={currentBranding}
                    contractTitle={contract.title}
                    effectiveTier={effectiveTier}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
