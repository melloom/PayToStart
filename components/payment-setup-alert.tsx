"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CreditCard, AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface PaymentSetupAlertProps {
  hasPaymentMethod: boolean;
  hasPaymentsPending: boolean;
  totalPendingAmount?: number;
  contractId?: string;
  onDismiss?: () => void;
}

export function PaymentSetupAlert({
  hasPaymentMethod,
  hasPaymentsPending,
  totalPendingAmount,
  contractId,
  onDismiss,
}: PaymentSetupAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || hasPaymentMethod) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <AlertTitle className="text-amber-900 dark:text-amber-100 font-semibold mb-2">
            {hasPaymentsPending 
              ? "Payment Received - Action Required!" 
              : "Set Up Payment Receiving"}
          </AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200 space-y-3">
            {hasPaymentsPending ? (
              <>
                <p>
                  You have received {totalPendingAmount ? `$${totalPendingAmount.toFixed(2)}` : "a payment"} from a client, 
                  but you don&apos;t have a payment method set up to receive funds.
                </p>
                <p className="font-semibold">
                  Add a payment method now to claim your payment!
                </p>
              </>
            ) : (
              <>
                <p>
                  You&apos;re sending contracts with payment requirements, but you don&apos;t have a payment method 
                  set up to receive funds from clients.
                </p>
                <p>
                  Set up your payment receiving method now so you can get paid when clients complete their payments.
                </p>
              </>
            )}
            <div className="flex items-center gap-3 pt-2">
              <Button
                asChild
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Link href="/dashboard/settings?tab=account">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
              >
                <X className="h-4 w-4 mr-1" />
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
