"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CreditCard, FileText, ExternalLink, Download, Calendar } from "lucide-react";
import { format } from "date-fns";
import PaymentMethods from "./payment-methods";

interface Invoice {
  id: string;
  number: string | null;
  amount: number;
  currency: string;
  status: string;
  created: string;
  periodStart: string | null;
  periodEnd: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  description: string;
}

interface ManageSubscriptionProps {
  customerId: string | null | undefined;
}

export default function ManageSubscription({ customerId }: ManageSubscriptionProps) {
  const { toast } = useToast();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

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

  const loadInvoices = async () => {
    if (!customerId) return;

    setIsLoadingInvoices(true);
    try {
      const response = await fetch("/api/subscriptions/invoices");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load invoices");
      }

      setInvoices(data.invoices || []);
    } catch (error: any) {
      console.error("Error loading invoices:", error);
      toast({
        title: "Error",
        description: "Failed to load invoice history.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  // Load invoices on mount if customer exists
  useEffect(() => {
    if (customerId) {
      loadInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

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

      {/* Payment Methods */}
      <PaymentMethods customerId={customerId} />

      {/* Invoice History */}
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            Invoice History
          </CardTitle>
          <CardDescription className="text-slate-400">
            View and download your billing invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingInvoices ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : invoices.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No invoices found. Invoices will appear here after your first payment.
            </p>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold text-white">
                        {invoice.number || invoice.id.slice(0, 12)}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          invoice.status === "paid"
                            ? "bg-green-900/50 text-green-300"
                            : invoice.status === "open"
                            ? "bg-amber-900/50 text-amber-300"
                            : "bg-red-900/50 text-red-300"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400 ml-7">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(invoice.created), "MMM d, yyyy")}
                      </span>
                      <span>
                        ${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {invoice.hostedInvoiceUrl && (
                      <a
                        href={invoice.hostedInvoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                        title="View invoice"
                      >
                        <ExternalLink className="h-4 w-4 text-indigo-400" />
                      </a>
                    )}
                    {invoice.invoicePdf && (
                      <a
                        href={invoice.invoicePdf}
                        download
                        className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4 text-indigo-400" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

