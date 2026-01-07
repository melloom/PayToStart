"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function SignSuccessPage() {
  const searchParams = useSearchParams();
  const contractId = searchParams.get("contract");
  const [message, setMessage] = useState("Your payment has been processed successfully. The final contract will be emailed to you shortly.");

  useEffect(() => {
    if (!contractId) {
      setMessage("Payment successful! Please check your email for the contract details.");
    }
  }, [contractId]);

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

