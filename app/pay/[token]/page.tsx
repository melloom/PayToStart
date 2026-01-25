"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CreditCard, CheckCircle, Shield, Zap, Mail } from "lucide-react";
import type { Contract, Client } from "@/lib/types";

// Force dynamic rendering - prevent static generation
export const dynamic = "force-dynamic";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [contract, setContract] = useState<Contract | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [clientEmail, setClientEmail] = useState<string>("");
  const [payments, setPayments] = useState<any[]>([]);
  const [remainingBalance, setRemainingBalance] = useState<number | null>(null);

  // Ensure we're on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only fetch after component is mounted (client-side only)
    if (!isMounted) return;

    async function fetchContract() {
      const token = params?.token as string | undefined;
      
      if (!token) {
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Invalid payment link",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await fetch(`/api/contracts/sign/${token}`);
        if (response.ok) {
          const data = await response.json();
          setContract(data.contract);
          setClient(data.client);
          
          // Set initial email from client or fieldValues
          const initialEmail = data.client?.email || 
            data.contract?.fieldValues?.clientEmail ||
            data.contract?.fieldValues?.email ||
            "";
          setClientEmail(initialEmail);
          
          // Log for debugging
          console.log("Contract data received:", {
            contractId: data.contract?.id,
            hasClient: !!data.client,
            clientEmail: initialEmail,
            contractStatus: data.contract?.status,
          });

          // Fetch payments to calculate remaining balance
          try {
            const paymentsResponse = await fetch(`/api/contracts/${data.contract.id}/payments`);
            if (paymentsResponse.ok) {
              const paymentsData = await paymentsResponse.json();
              setPayments(paymentsData.payments || []);
              
              const totalPaid = (paymentsData.payments || [])
                .filter((p: any) => p.status === "completed")
                .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
              const remaining = (data.contract.totalAmount || 0) - totalPaid;
              setRemainingBalance(remaining);
            }
          } catch (error) {
            console.error("Error fetching payments:", error);
          }

          // Check if already paid
          if (data.contract.status === "completed") {
            setPaymentCompleted(true);
          } else if (data.contract.status !== "signed" && data.contract.status !== "paid") {
            // Must be signed first
            router.push(`/sign/${token}`);
          }
        } else {
          toast({
            title: "Error",
            description: "Contract not found or invalid link",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load contract",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchContract();
  }, [isMounted, params, router, toast]);

  const handlePayment = async () => {
    if (!contract) return;
    
    // Calculate payment amount - use remaining balance if contract is already paid, otherwise use deposit
    const totalPaid = payments
      .filter((p: any) => p.status === "completed")
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const calculatedRemainingBalance = (contract.totalAmount || 0) - totalPaid;
    const isRemainingBalancePayment = contract.status === "paid" || totalPaid > 0;
    const paymentAmount = isRemainingBalancePayment && calculatedRemainingBalance > 0.01
      ? calculatedRemainingBalance
      : contract.depositAmount;
    
    if (paymentAmount <= 0) {
      toast({
        title: "No Payment Required",
        description: "This contract is already fully paid.",
        variant: "default",
      });
      return;
    }

    const token = params?.token as string | undefined;
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid payment link",
        variant: "destructive",
      });
      return;
    }

    // Validate email if provided
    const emailToUse = clientEmail.trim();
    if (emailToUse && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToUse)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!emailToUse) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to continue",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create Stripe checkout session
      // Use absolute URL to avoid Next.js routing issues
      const apiUrl = typeof window !== "undefined" 
        ? `${window.location.origin}/api/stripe/create-checkout`
        : "/api/stripe/create-checkout";
      console.log("Calling create-checkout API:", apiUrl, { contractId: contract.id, hasToken: !!token });
      
      console.log("Sending payment request:", {
        contractId: contract.id,
        hasClient: !!client,
        clientEmail: emailToUse,
        depositAmount: contract.depositAmount,
      });
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id,
          signingToken: token,
          amount: contract.depositAmount,
          currency: "usd",
          // Pass client email from input field
          clientEmail: emailToUse,
        }),
      });

      console.log("Create-checkout response status:", response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = "Failed to create payment session";
        let errorData: any = null;
        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error("Payment API error:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
        } catch (e) {
          // If response isn't JSON, use status text
          const responseText = await response.text().catch(() => "");
          console.error("Payment API error (non-JSON):", {
            status: response.status,
            statusText: response.statusText,
            body: responseText.substring(0, 200),
          });
          errorMessage = response.status === 404 
            ? "Payment service is not available. Please try again in a moment."
            : `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const { sessionId } = await response.json();
      
      // Dynamically import Stripe to avoid SSR issues
      const { getStripe } = await import("@/lib/stripe");
      const stripe = await getStripe();

      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      // Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // Show loading state until mounted (prevents SSR issues)
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!contract || contract.depositAmount <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Payment Required</CardTitle>
            <CardDescription>
              This contract does not require a deposit payment.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (paymentCompleted || contract.status === "paid" || contract.status === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg border-2 border-green-200 shadow-2xl bg-white">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg animate-pulse">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-slate-600 text-lg">
              Your deposit has been processed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-xl">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Amount Paid:</span>
                  <span className="font-bold text-2xl text-green-600">
                    ${contract.depositAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-green-300">
                  <span className="text-slate-600 font-medium">Remaining Balance:</span>
                  <span className="font-semibold text-lg text-slate-700">
                    ${(contract.totalAmount - contract.depositAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
              <p className="text-sm text-blue-900">
                <strong className="font-semibold">What&apos;s Next?</strong>
                <br />
                Your contract has been finalized and a copy has been sent to your email. 
                You&apos;ll receive a receipt for this payment shortly.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Receipt sent to your email</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Payment</h1>
          <p className="text-slate-600 text-lg">
            Secure payment processing for faster contract completion
          </p>
        </div>

        <Card className="border-2 border-slate-200 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
            <CardTitle className="text-2xl font-bold text-slate-900">Payment Summary</CardTitle>
            <CardDescription className="text-slate-600">
              Review your contract details and complete payment securely
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Contract Info */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 p-6 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Contract:</span>
                <span className="font-bold text-slate-900 text-lg">{contract.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Total Amount:</span>
                <span className="font-semibold text-slate-700">${contract.totalAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-purple-300 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Deposit Required</p>
                    <p className="text-xs text-slate-500">Pay now to secure your contract</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      ${contract.depositAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Benefits */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-900 text-sm">Instant Processing</p>
                  <p className="text-xs text-green-700 mt-1">Payment processed immediately</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Secure & Safe</p>
                  <p className="text-xs text-blue-700 mt-1">256-bit SSL encryption</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-purple-900 text-sm">Fast Completion</p>
                  <p className="text-xs text-purple-700 mt-1">Contract finalized instantly</p>
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="client-email" className="text-slate-700 font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="client-email"
                type="email"
                placeholder="your.email@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="h-12 text-base text-slate-900 bg-white border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                required
              />
              <p className="text-xs text-slate-500">
                We&apos;ll send your payment receipt to this email address
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-5 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Secure Payment Processing</p>
                  <p className="text-sm text-blue-800">
                    Your payment is processed securely through Stripe, a PCI-DSS Level 1 certified payment processor. 
                    You&apos;ll receive a receipt via email immediately after payment completion.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all h-14 text-lg font-semibold"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay ${contract.depositAmount.toFixed(2)} Now
                </>
              )}
            </Button>

            {/* Payment Methods */}
            <div className="text-center pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-2">Accepted Payment Methods</p>
              <div className="flex items-center justify-center gap-2">
                <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                  💳 Credit Cards
                </div>
                <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                  🏦 Debit Cards
                </div>
                <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                  📱 Apple Pay
                </div>
                <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                  📱 Google Pay
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


