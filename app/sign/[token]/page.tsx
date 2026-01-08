"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { SignatureCanvas } from "@/components/signature/signature-canvas";
import type { Contract, Client } from "@/lib/types";

const signSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  agree: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
  signatureDataUrl: z.string().nullable().optional(),
});

type SignForm = z.infer<typeof signSchema>;

export default function SignContractPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [contract, setContract] = useState<Contract | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  
  // Check for canceled parameter
  const canceled = searchParams.get("canceled");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignForm>({
    resolver: zodResolver(signSchema),
    defaultValues: {
      agree: false,
      signatureDataUrl: null,
    },
  });

  const agreeValue = watch("agree");

  useEffect(() => {
    async function fetchContract() {
      try {
        const response = await fetch(`/api/contracts/sign/${params.token}`);
        if (response.ok) {
          const data = await response.json();
          setContract(data.contract);
          setClient(data.client);
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
    
    // Show message if payment was canceled
    if (canceled === "1") {
      toast({
        title: "Payment Canceled",
        description: "Payment was canceled. You can try again when ready.",
        variant: "default",
      });
    }
  }, [params.token, toast, canceled]);

  const handleSignatureChange = (dataUrl: string | null) => {
    setSignatureDataUrl(dataUrl);
    setValue("signatureDataUrl", dataUrl || null);
  };

  const onSubmit = async (data: SignForm) => {
    if (!contract) return;

    setIsSigning(true);
    try {
      // Get client IP and user agent
      const ipResponse = await fetch("/api/ip");
      const ipData = await ipResponse.json().catch(() => ({ ip: "unknown" }));

      // Submit signature
      const response = await fetch(`/api/contracts/sign/${params.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          signatureDataUrl: data.signatureDataUrl,
          ip: ipData.ip || "unknown",
          userAgent: navigator.userAgent,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // If deposit is required, redirect to Stripe Checkout
        if (contract.depositAmount > 0 && result.checkoutUrl) {
          toast({
            title: "Contract signed!",
            description: "Redirecting to payment...",
          });
          // Redirect to Stripe Checkout
          window.location.href = result.checkoutUrl;
        } else if (contract.depositAmount > 0) {
          // Fallback to payment page if checkout URL not provided
          toast({
            title: "Contract signed!",
            description: "Redirecting to payment...",
          });
          router.push(`/pay/${params.token}`);
        } else {
          // No deposit, mark as completed immediately
          toast({
            title: "Contract signed!",
            description: "Finalizing contract...",
          });
          await fetch(`/api/contracts/finalize/${params.token}`, {
            method: "POST",
          });
          router.push(`/sign/${params.token}/complete`);
        }
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to sign contract",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Contract Not Found</CardTitle>
            <CardDescription>
              This contract link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (contract.status === "signed" || contract.status === "paid" || contract.status === "completed") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Contract Already Signed</CardTitle>
            <CardDescription>
              This contract has already been signed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Step A: Review */}
        <Card>
          <CardHeader>
            <CardTitle>Step A: Review Contract</CardTitle>
            <CardDescription>
              Please carefully review the contract terms below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Deposit Amount - Prominently Displayed */}
            {contract.depositAmount > 0 && (
              <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-green-700 font-semibold mb-1 uppercase tracking-wide">Deposit Required</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ${contract.depositAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Pay now to secure your contract</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-700 font-semibold mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-green-800">
                      ${contract.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Balance: ${(contract.totalAmount - contract.depositAmount).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-300">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="font-medium">Get Paid Faster:</span>
                    <span>Integrated payment processing means instant completion</span>
                  </div>
                </div>
              </div>
            )}

            {/* Contract Content */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Contract Terms</h3>
              <div className="prose max-w-none whitespace-pre-wrap bg-white p-6 rounded-lg border max-h-96 overflow-y-auto">
                {contract.content}
              </div>
            </div>

            {/* Financial Summary */}
            {contract.depositAmount === 0 && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-semibold">${contract.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step B: Sign */}
        <Card>
          <CardHeader>
            <CardTitle>Step B: Sign Contract</CardTitle>
            <CardDescription>
              Sign the contract to proceed{contract.depositAmount > 0 ? " to payment" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Signature Section */}
              <div className="space-y-6">
                {/* Full Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Type your full name as signature"
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Signature Canvas */}
                <div className="space-y-2">
                  <Label>Signature (Optional)</Label>
                  <SignatureCanvas
                    onSignatureChange={handleSignatureChange}
                    value={signatureDataUrl || undefined}
                  />
                </div>

                {/* Agreement Checkbox */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agree"
                    checked={agreeValue}
                    onCheckedChange={(checked) => setValue("agree", checked === true)}
                  />
                  <Label
                    htmlFor="agree"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    I agree to the terms and conditions stated in this contract. By checking this box, I confirm that I have read, understood, and agree to be bound by all terms of this agreement.
                  </Label>
                </div>
                {errors.agree && (
                  <p className="text-sm text-destructive">
                    {errors.agree.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSigning}
                  className="min-w-[120px]"
                >
                  {isSigning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing...
                    </>
                  ) : (
                    "Sign Contract"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
