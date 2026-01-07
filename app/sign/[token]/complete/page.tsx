"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, FileText } from "lucide-react";
import Link from "next/link";

export default function PaymentCompletePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) {
        setStatus("error");
        setMessage("No session ID provided");
        return;
      }

      try {
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.verified) {
            setStatus("success");
            setMessage("Your payment has been processed successfully. The final contract will be emailed to you shortly.");
          } else {
            setStatus("error");
            setMessage("Payment verification failed. Please contact support.");
          }
        } else {
          setStatus("error");
          setMessage("Failed to verify payment. Please check your dashboard or contact support.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred while verifying your payment.");
      }
    }

    verifyPayment();
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Processing Payment...</CardTitle>
            <CardDescription>Please wait while we verify your payment</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Payment Verification Failed</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you were charged but see this error, please contact support with your payment receipt.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription className="mt-2">{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-sm text-green-900">
              <strong>What happens next?</strong>
            </p>
            <ul className="text-sm text-green-800 mt-2 space-y-1 list-disc list-inside">
              <li>Your deposit payment has been confirmed</li>
              <li>The final contract PDF is being generated</li>
              <li>You'll receive a copy via email shortly</li>
              <li>The contractor has also been notified</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Please check your email (including spam folder) for the final contract PDF.
              You can also download it from the link in the email.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

