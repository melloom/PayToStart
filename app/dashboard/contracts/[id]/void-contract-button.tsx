"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface VoidContractButtonProps {
  contractId: string;
  contractStatus: string;
  hasPayments: boolean;
  bothSigned: boolean;
}

export function VoidContractButton({
  contractId,
  contractStatus,
  hasPayments,
  bothSigned,
}: VoidContractButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [refundOption, setRefundOption] = useState<"automatic" | "manual" | "keep">("automatic");
  const [cancellationFee, setCancellationFee] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleVoid = async () => {
    setIsVoiding(true);
    try {
      const requestBody: any = {
        refundOption: refundOption,
      };
      
      if (cancellationFee && parseFloat(cancellationFee) > 0) {
        requestBody.cancellationFee = parseFloat(cancellationFee);
      }
      
      if (refundReason.trim()) {
        requestBody.refundReason = refundReason.trim();
      }
      
      const response = await fetch(`/api/contracts/${contractId}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to void contract");
      }

      toast({
        title: "Contract Voided",
        description: data.message || "Contract has been marked as void",
        variant: data.warning ? "default" : "default",
      });

      if (data.refundOption === "keep") {
        toast({
          title: "Contract Voided - Payments Kept",
          description: "Contract has been voided. Payments will be kept as selected.",
          duration: 5000,
        });
      } else if (data.refundOption === "manual") {
        toast({
          title: "Contract Voided - Manual Refunds Required",
          description: "Contract voided. Please process refunds manually through your payment processor.",
          duration: 5000,
        });
      } else if (data.refundsProcessed > 0) {
        const totalPaid = data.paymentInfo?.totalPaid || 0;
        const fee = data.paymentInfo?.cancellationFee || 0;
        let description = `${data.refundsProcessed} payment(s) totaling $${totalPaid.toFixed(2)} have been refunded.`;
        if (fee > 0) {
          description += ` Cancellation fee of $${fee.toFixed(2)} was applied.`;
        }
        toast({
          title: "Refunds Processed",
          description: description,
          duration: 5000,
        });
      }

      if (data.refundsFailed > 0) {
        toast({
          title: "Some Refunds Failed",
          description: `${data.refundsFailed} payment(s) could not be refunded. ${data.refundsManual > 0 ? 'Some require manual processing due to insufficient funds.' : 'Please process manually.'}`,
          variant: "destructive",
          duration: 5000,
        });
      }

      if (data.refundsManual > 0 && data.refundOption === "automatic") {
        toast({
          title: "Manual Refunds Required",
          description: `${data.refundsManual} payment(s) require manual refund processing (insufficient funds or other issues).`,
          variant: "destructive",
          duration: 5000,
        });
      }

      if (data.paymentInfo?.pendingPaymentsCount > 0) {
        toast({
          title: "Pending Payments Cancelled",
          description: `${data.paymentInfo.pendingPaymentsCount} pending payment(s) have been cancelled.`,
        });
      }

      if (data.warning) {
        toast({
          title: "Warning",
          description: data.warning,
          variant: "destructive",
        });
      }

      setShowDialog(false);
      // Refresh the page to show updated status
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to void contract",
        variant: "destructive",
      });
    } finally {
      setIsVoiding(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        variant="outline"
        className="w-full text-destructive hover:text-destructive"
      >
        <X className="h-4 w-4 mr-2" />
        Mark as Void
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle>Void Contract</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to void this contract? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {hasPayments && (
              <>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    Payment Handling Required
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    This contract has completed payments. Choose how to handle refunds below.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Refund Option</Label>
                  <Select value={refundOption} onValueChange={(value) => setRefundOption(value as "automatic" | "manual" | "keep")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose refund option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic Refund</SelectItem>
                      <SelectItem value="manual">Manual Refund (Process Later)</SelectItem>
                      <SelectItem value="keep">Keep Payment</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    {refundOption === "automatic" && (
                      <p>Refund all payments immediately via Stripe. If your account has insufficient funds, refunds will fail and require manual processing.</p>
                    )}
                    {refundOption === "manual" && (
                      <p>Mark for manual refund processing. You'll process refunds yourself through Stripe dashboard or other means.</p>
                    )}
                    {refundOption === "keep" && (
                      <p>Keep the payment (e.g., per contract terms, cancellation fees, work already completed). No refunds will be processed.</p>
                    )}
                  </div>
                  
                  {refundOption === "automatic" && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        <Info className="h-3 w-3 inline mr-1" />
                        Refunds will be processed immediately. If your Stripe account has insufficient funds, refunds will fail and require manual processing.
                      </p>
                    </div>
                  )}
                  
                  {refundOption === "manual" && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        <Info className="h-3 w-3 inline mr-1" />
                        You'll need to process refunds manually through your Stripe dashboard or payment processor.
                      </p>
                    </div>
                  )}
                  
                  {refundOption === "keep" && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-2">
                      <p className="text-xs text-orange-800 dark:text-orange-200">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        Ensure this aligns with your contract terms and applicable laws. Valid reasons include: work completed, cancellation fees, non-refundable deposits.
                      </p>
                    </div>
                  )}

                  {refundOption === "automatic" && (
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="cancellation-fee" className="text-sm">
                        Cancellation Fee (Optional)
                      </Label>
                      <Input
                        id="cancellation-fee"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={cancellationFee}
                        onChange={(e) => setCancellationFee(e.target.value)}
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">
                        If specified, this fee will be deducted from refunds. Leave empty for full refunds.
                      </p>
                    </div>
                  )}

                  {refundOption === "automatic" && (
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="refund-reason" className="text-sm">
                        Refund Reason (Optional)
                      </Label>
                      <Input
                        id="refund-reason"
                        type="text"
                        placeholder="e.g., Contract voided by mutual agreement"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">
                        This will be included in the refund metadata for record-keeping.
                      </p>
                    </div>
                  )}

                  {refundOption === "keep" && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          <strong>Note:</strong> Keeping payments should align with your contract terms and applicable laws. 
                          Ensure you have a valid reason (e.g., work completed, cancellation fees, non-refundable deposits).
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {bothSigned && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                  Both Parties Signed
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  Both parties have signed this contract. Voiding it will cancel the agreement.
                </p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">What happens when you void:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Contract status will be changed to "Cancelled"</li>
                {hasPayments && <li>All completed payments will be refunded</li>}
                <li>Contract will no longer be active</li>
                <li>This action will be logged in the audit trail</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isVoiding}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleVoid}
              disabled={isVoiding}
            >
              {isVoiding ? "Voiding..." : "Yes, Void Contract"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
