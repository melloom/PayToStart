"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import type { Contract, Client } from "@/lib/types";

// Initialize Stripe - will load the key from environment
const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error("Stripe publishable key not configured");
  }
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [contract, setContract] = useState<Contract | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    async function fetchContract() {
      try {
        const response = await fetch(`/api/contracts/sign/${params.token}`);
        if (response.ok) {
          const data = await response.json();
          setContract(data.contract);
          setClient(data.client);

          // Check if already paid
          if (data.contract.status === "paid" || data.contract.status === "completed") {
            setPaymentCompleted(true);
          } else if (data.contract.status !== "signed") {
            // Must be signed first
            router.push(`/sign/${params.token}`);
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

    if (params.token) {
      fetchContract();
    }
  }, [params.token, router, toast]);

  const handlePayment = async () => {
    if (!contract || contract.depositAmount <= 0) return;

    setIsProcessing(true);
    try {
      // Create Stripe checkout session
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id,
          signingToken: params.token,
          amount: contract.depositAmount,
          currency: "usd",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create payment session");
      }

      const { sessionId } = await response.json();
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

  if (isLoading) {
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Payment Complete
            </CardTitle>
            <CardDescription>
              Your deposit has been successfully processed. The final contract will be sent to your email shortly.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Payment Required</CardTitle>
            <CardDescription>
              Please complete your deposit payment to finalize the contract
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-6 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Contract:</span>
                <span className="font-semibold">{contract.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-semibold">${contract.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg border-t pt-4">
                <span className="font-medium">Deposit Required:</span>
                <span className="font-bold text-primary">${contract.depositAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Secure Payment:</strong> Your payment is processed securely through Stripe. 
                You'll receive a receipt via email once the payment is complete.
              </p>
            </div>

            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ${contract.depositAmount.toFixed(2)} Deposit
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

