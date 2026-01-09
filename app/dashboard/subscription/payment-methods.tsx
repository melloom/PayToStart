"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PaymentMethodsProps {
  customerId: string;
}

export default function PaymentMethods({ customerId }: PaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const { toast } = useToast();

  const loadPaymentMethods = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscriptions/payment-methods");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load payment methods");
      }

      setPaymentMethods(data.paymentMethods);
      setDefaultPaymentMethod(data.defaultPaymentMethod);
    } catch (error: any) {
      console.error("Error loading payment methods:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load payment methods.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (customerId) {
      loadPaymentMethods();
    }
  }, [customerId, loadPaymentMethods]);

  const handleManagePaymentMethods = async () => {
    setIsPortalLoading(true);
    try {
      const response = await fetch("/api/subscriptions/billing-portal", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create billing portal session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No billing portal URL received");
      }
    } catch (error: any) {
      console.error("Error opening billing portal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  if (!customerId) {
    return null;
  }

  return (
    <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-indigo-400" />
          Payment Methods
        </CardTitle>
        <CardDescription className="text-slate-300">
          Manage your saved payment methods securely via Stripe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        ) : paymentMethods.length === 0 ? (
          <p className="text-sm text-slate-400">No payment methods on file.</p>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((pm) => (
              <div
                key={pm.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  pm.id === defaultPaymentMethod
                    ? "border-indigo-500 bg-indigo-900/20"
                    : "border-slate-700 bg-slate-700/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-white">
                      **** **** **** {pm.card?.last4}
                    </p>
                    <p className="text-xs text-slate-400">
                      {pm.card?.brand} • Expires {pm.card?.expMonth}/{pm.card?.expYear}
                    </p>
                  </div>
                </div>
                {pm.id === defaultPaymentMethod && (
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        <Button
          onClick={handleManagePaymentMethods}
          disabled={isPortalLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg font-semibold"
        >
          {isPortalLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Opening Portal...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Manage Payment Methods
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

