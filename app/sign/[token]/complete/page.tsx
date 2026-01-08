"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, Mail, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignCompletePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "error">("pending");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Verify payment status if session ID is provided
    if (sessionId) {
      verifyPayment();
    } else {
      setIsVerifying(false);
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentStatus(data.paid ? "paid" : "pending");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setPaymentStatus("error");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-2 border-slate-200 shadow-xl bg-white">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-slate-600">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg animate-pulse">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Contract Complete!
          </h1>
          <p className="text-slate-600 text-lg">
            Your contract has been signed and processed successfully
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Contract Signed Card */}
          <Card className="border-2 border-green-200 shadow-lg bg-white">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">Contract Signed</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-600 text-sm">
                Your digital signature has been recorded and the contract is now legally binding.
              </p>
            </CardContent>
          </Card>

          {/* Payment Status Card */}
          {paymentStatus === "paid" && (
            <Card className="border-2 border-blue-200 shadow-lg bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900">Payment Processed</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-600 text-sm">
                  Your payment has been successfully processed. A receipt has been sent to your email.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Info Card */}
        <Card className="border-2 border-slate-200 shadow-xl bg-white mb-6">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
            <CardTitle className="text-2xl font-bold text-slate-900">What Happens Next?</CardTitle>
            <CardDescription className="text-slate-600">
              Your contract is being finalized and processed
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Mail className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 mb-1">Email Confirmation</p>
                <p className="text-sm text-green-800">
                  A finalized copy of your contract has been sent to your email address. 
                  Check your inbox (and spam folder) for the confirmation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Contract PDF</p>
                <p className="text-sm text-blue-800">
                  A signed PDF version of your contract is available in the email. 
                  Download and save it for your records.
                </p>
              </div>
            </div>

            {paymentStatus === "paid" && (
              <div className="flex items-start gap-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-900 mb-1">Payment Receipt</p>
                  <p className="text-sm text-purple-800">
                    A payment receipt has been sent to your email. Keep this for your records.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card className="border-2 border-slate-200 shadow-lg bg-white">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
            <CardTitle className="text-xl font-bold text-slate-900">Get Paid Faster</CardTitle>
            <CardDescription className="text-slate-600">
              Integrated payment processing means faster completion
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white border border-slate-200 rounded-lg">
                <div className="text-3xl mb-2">⚡</div>
                <p className="font-semibold text-slate-900 text-sm mb-1">Instant Processing</p>
                <p className="text-xs text-slate-600">Payments processed immediately</p>
              </div>
              <div className="text-center p-4 bg-white border border-slate-200 rounded-lg">
                <div className="text-3xl mb-2">🔒</div>
                <p className="font-semibold text-slate-900 text-sm mb-1">Secure & Safe</p>
                <p className="text-xs text-slate-600">Bank-level encryption</p>
              </div>
              <div className="text-center p-4 bg-white border border-slate-200 rounded-lg">
                <div className="text-3xl mb-2">📧</div>
                <p className="font-semibold text-slate-900 text-sm mb-1">Auto Receipts</p>
                <p className="text-xs text-slate-600">Receipts sent automatically</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
