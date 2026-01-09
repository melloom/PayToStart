"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Plus, Loader2, ExternalLink } from "lucide-react";

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  isDefault: boolean;
}

export default function PaymentMethods() {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscriptions/payment-methods");
      if (!response.ok) {
        throw new Error("Failed to load payment methods");
      }
      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);
    } catch (error: any) {
      console.error("Error loading payment methods:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    setIsOpeningPortal(true);
    try {
      const response = await fetch("/api/subscriptions/billing-portal", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to open billing portal");
      }

      const data = await response.json();
      if (data.url) {
        // Open billing portal in new window
        window.open(data.url, "_blank");
        toast({
          title: "Billing Portal",
          description: "Opening billing portal to manage payment methods...",
        });
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error: any) {
      console.error("Error opening billing portal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const getCardBrandIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes("visa")) return "💳";
    if (brandLower.includes("mastercard")) return "💳";
    if (brandLower.includes("amex") || brandLower.includes("american")) return "💳";
    if (brandLower.includes("discover")) return "💳";
    return "💳";
  };

  const formatCardBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-400" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-400" />
              Payment Methods
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Manage your saved payment methods and billing information
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-slate-700/50 border border-slate-600 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-300 mb-2 font-medium">No payment methods saved</p>
            <p className="text-sm text-slate-400 mb-6">
              Add a payment method to manage your subscription billing
            </p>
            <Button
              onClick={handleOpenBillingPortal}
              disabled={isOpeningPortal}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg font-semibold"
            >
              {isOpeningPortal ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg backdrop-blur-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">
                      {pm.card ? getCardBrandIcon(pm.card.brand) : "💳"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {pm.card ? formatCardBrand(pm.card.brand) : "Card"} •••• {pm.card?.last4}
                        </span>
                        {pm.isDefault && (
                          <span className="px-2 py-0.5 bg-indigo-600/30 text-indigo-300 text-xs font-medium rounded border border-indigo-500/50">
                            Default
                          </span>
                        )}
                      </div>
                      {pm.card && (
                        <p className="text-sm text-slate-400 mt-1">
                          Expires {String(pm.card.expMonth).padStart(2, "0")}/{pm.card.expYear}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={handleOpenBillingPortal}
              disabled={isOpeningPortal}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
            >
              {isOpeningPortal ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Payment Methods
                </>
              )}
            </Button>
            <p className="text-xs text-slate-500 text-center">
              Use the billing portal to add, remove, or set default payment methods
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

