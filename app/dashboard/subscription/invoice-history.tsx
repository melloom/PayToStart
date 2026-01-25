"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, FileText, ExternalLink, Download, Calendar } from "lucide-react";
import { format } from "date-fns";

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

interface InvoiceHistoryProps {
  customerId: string | null | undefined;
}

export default function InvoiceHistory({ customerId }: InvoiceHistoryProps) {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

  const loadInvoices = async () => {
    if (!customerId) return;

    setIsLoadingInvoices(true);
    try {
      const response = await fetch("/api/subscriptions/invoices");
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error: any) {
      // Only show toast for non-network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        // Network error - might be offline or server issue
        console.warn("Network error loading invoices - this may be expected if offline");
      } else {
        console.error("Error loading invoices:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load invoice history.",
          variant: "destructive",
        });
      }
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
    return null;
  }

  return (
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
  );
}
