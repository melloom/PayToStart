"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CreditCard, ExternalLink } from "lucide-react";

interface ManageSubscriptionProps {
  customerId: string | null | undefined;
}

export default function ManageSubscription({ customerId }: ManageSubscriptionProps) {
  const { toast } = useToast();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const handleOpenBillingPortal = async () => {
    if (!customerId) {
      toast({
        title: "No subscription",
        description: "You need an active subscription to manage billing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingPortal(true);
    try {
      const response = await fetch("/api/subscriptions/billing-portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to open billing portal");
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
      setIsLoadingPortal(false);
    }
  };


  if (!customerId) {
    return (
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-400" />
            Manage Subscription
          </CardTitle>
          <CardDescription className="text-slate-400">
            Manage your payment methods and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">
            You need an active subscription to manage billing settings.
          </p>
          <Button
            onClick={() => window.location.href = "/pricing"}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            View Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Manage Subscription Button */}
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-400" />
            Manage Subscription
          </CardTitle>
          <CardDescription className="text-slate-400">
            Update payment methods, view invoices, and manage billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleOpenBillingPortal}
            disabled={isLoadingPortal}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg font-semibold"
          >
            {isLoadingPortal ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Opening Portal...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Stripe Customer Portal
              </>
            )}
          </Button>
          <p className="text-xs text-slate-500 mt-3 text-center">
            Manage payment methods, download invoices, and update billing information securely through Stripe
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

