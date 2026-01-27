"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign, Clock, CheckCircle, AlertCircle, Download, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface FinancialTabProps {
  companyId: string;
}

interface Payment {
  id: string;
  contractId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: Date | string;
  completedAt?: Date | string;
  paymentIntentId?: string;
  contract?: {
    id: string;
    title: string;
    clientId: string;
    client?: {
      name: string;
      email: string;
    };
  };
}

export default function FinancialTab({ companyId }: FinancialTabProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [companyId]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/payments?companyId=${companyId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (err: any) {
      setError(err.message || "Failed to load payments");
      console.error("Error fetching payments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const completedPayments = payments.filter(p => p.status === "completed");
  const pendingPayments = payments.filter(p => p.status === "pending");
  const failedPayments = payments.filter(p => p.status === "failed");

  const totalCompleted = completedPayments.reduce((sum, p) => sum + (typeof p.amount === 'number' ? p.amount : parseFloat(p.amount || 0)), 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + (typeof p.amount === 'number' ? p.amount : parseFloat(p.amount || 0)), 0);
  const totalFailed = failedPayments.reduce((sum, p) => sum + (typeof p.amount === 'number' ? p.amount : parseFloat(p.amount || 0)), 0);

  // Sort payments by date (newest first) - use useMemo to prevent setState during render
  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
      // Convert dates to Date objects if they're strings
      const getDate = (date: Date | string | undefined): Date => {
        if (!date) return new Date(0); // Fallback to epoch if no date
        if (date instanceof Date) return date;
        return new Date(date);
      };
      
      const dateA = getDate(a.completedAt || a.createdAt);
      const dateB = getDate(b.completedAt || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }, [payments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
              Total Received
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              ${totalCompleted.toFixed(2)}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {completedPayments.length} {completedPayments.length === 1 ? 'payment' : 'payments'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              ${totalPending.toFixed(2)}
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              {pendingPayments.length} {pendingPayments.length === 1 ? 'payment' : 'payments'} processing
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              All Time Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              ${(totalCompleted + totalPending).toFixed(2)}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {payments.length} total {payments.length === 1 ? 'transaction' : 'transactions'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            View all payments received from clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedPayments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-medium mb-2">No transactions yet</p>
              <p className="text-sm">Payments will appear here once clients complete their payments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedPayments.map((payment) => {
                const amount = typeof payment.amount === 'number' ? payment.amount : parseFloat(payment.amount || 0);
                // Convert date to Date object if it's a string
                const dateValue = payment.completedAt || payment.createdAt;
                const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
                
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "default"
                              : payment.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            payment.status === "completed"
                              ? "bg-green-600"
                              : payment.status === "pending"
                              ? "bg-amber-600"
                              : "bg-red-600"
                          }
                        >
                          {payment.status === "completed"
                            ? "Completed"
                            : payment.status === "pending"
                            ? "Pending"
                            : "Failed"}
                        </Badge>
                        <span className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                          ${amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        {payment.contract ? (
                          <>
                            <p>
                              <span className="font-medium">Contract:</span> {payment.contract.title}
                            </p>
                            {payment.contract.client && (
                              <p>
                                <span className="font-medium">Client:</span> {payment.contract.client.name}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-slate-500">Contract details loading...</p>
                        )}
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {format(date, "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {payment.contract && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                        >
                          <Link href={`/dashboard/contracts/${payment.contract.id}`}>
                            View Contract
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
