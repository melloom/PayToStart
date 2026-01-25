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
import { Loader2, Shield, Lock, CheckCircle2, DollarSign, CreditCard, Info } from "lucide-react";
import { SignatureCanvas } from "@/components/signature/signature-canvas";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [verifiedPassword, setVerifiedPassword] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  
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
          // Show welcome dialog when contract loads
          setShowWelcomeDialog(true);
        } else {
          const errorData = await response.json();
          if (errorData.requiresPassword) {
            // Contract requires password
            setRequiresPassword(true);
            setShowPasswordDialog(true);
          } else {
            toast({
              title: "Error",
              description: errorData.message || "Contract not found or invalid link",
              variant: "destructive",
            });
          }
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

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    setPasswordError("");
    setIsLoading(true);
    
    try {
      // Try to fetch contract with password
      const response = await fetch(`/api/contracts/sign/${params.token}?password=${encodeURIComponent(password)}`);
      if (response.ok) {
        const data = await response.json();
        setContract(data.contract);
        setClient(data.client);
        setShowPasswordDialog(false);
        setVerifiedPassword(password); // Store verified password for signing
        setRequiresPassword(false);
        // Show welcome dialog when contract loads
        setShowWelcomeDialog(true);
      } else {
        const errorData = await response.json();
        setPasswordError(errorData.message || "Invalid password");
      }
    } catch (error) {
      setPasswordError("Failed to verify password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignatureChange = (dataUrl: string | null) => {
    setSignatureDataUrl(dataUrl);
    setValue("signatureDataUrl", dataUrl || null);
  };

  const onSubmit = async (data: SignForm) => {
    // SECURITY: Ensure password is verified before allowing signature submission
    if (requiresPassword && !verifiedPassword) {
      toast({
        title: "Password Required",
        description: "Please enter the contract password first",
        variant: "destructive",
      });
      setShowPasswordDialog(true);
      return;
    }
    if (!contract) return;

    setIsSigning(true);
    try {
      // Get client IP and user agent
      const ipResponse = await fetch("/api/ip");
      const ipData = await ipResponse.json().catch(() => ({ ip: "unknown" }));

      // SECURITY: Include password in request body (not URL) if contract requires it
      const requestBody: any = {
        fullName: data.fullName,
        signatureDataUrl: data.signatureDataUrl,
        ip: ipData.ip || "unknown",
        userAgent: navigator.userAgent,
      };
      
      // Include password in body if contract requires it
      if (requiresPassword && verifiedPassword) {
        requestBody.password = verifiedPassword;
      }
      
      const response = await fetch(`/api/contracts/sign/${params.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
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

  // Get payment information from contract metadata or fieldValues
  const paymentTerms = (contract as any)?.paymentTerms || (contract as any)?.fieldValues?.paymentTerms || "";
  const compensationType = (contract as any)?.compensationType || (contract as any)?.fieldValues?.compensationType || "";
  const paymentSchedule = (contract as any)?.fieldValues?.paymentSchedule || "";
  const paymentScheduleConfig = (contract as any)?.fieldValues?.paymentScheduleConfig || {};
  const hasDeposit = contract.depositAmount > 0;
  const paymentRequired = hasDeposit ? "on sign" : "after signing";
  
  // Calculate payment deadlines
  const getDepositDeadline = () => {
    if (!hasDeposit) return null;
    // If deposit is required, it's due on sign
    return "Upon signing";
  };
  
  const getBalanceDeadline = () => {
    if (contract.depositAmount >= contract.totalAmount) return null;
    const balance = contract.totalAmount - contract.depositAmount;
    if (balance <= 0) return null;
    
    // Check for balance due date in payment schedule config
    if (paymentScheduleConfig?.balanceDueDate) {
      try {
        const dueDate = new Date(paymentScheduleConfig.balanceDueDate);
        const now = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue > 0) {
          return {
            date: dueDate,
            days: daysUntilDue,
            formatted: dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          };
        } else {
          return {
            date: dueDate,
            days: 0,
            formatted: dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            overdue: true
          };
        }
      } catch (e) {
        // Invalid date, fall through to default
      }
    }
    
    // Default: based on payment schedule
    if (paymentSchedule === "upfront") {
      return { date: null, days: 0, formatted: "Upon signing", immediate: true };
    } else if (paymentSchedule === "full") {
      return { date: null, days: null, formatted: "Upon completion" };
    } else if (paymentSchedule === "partial") {
      // Default 30 days if not specified
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      return {
        date: defaultDate,
        days: 30,
        formatted: defaultDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      };
    }
    
    return null;
  };
  
  const depositDeadline = getDepositDeadline();
  const balanceDeadline = getBalanceDeadline();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        if (!open && requiresPassword) {
          // Don't allow closing if password is required
          return;
        }
        setShowPasswordDialog(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Lock className="h-6 w-6 text-blue-600" />
              Password Required
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              This contract is password protected. Please enter the password to view and sign the contract.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contractPassword">Password</Label>
              <Input
                id="contractPassword"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit();
                  }
                }}
                autoFocus
              />
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={handlePasswordSubmit}
                disabled={isLoading || !password.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Continue
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Welcome Dialog */}
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Info className="h-6 w-6 text-blue-600" />
              Welcome!
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {client?.name ? `Hello ${client.name}!` : "Hello!"} You've been invited to review and sign a contract.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Payment Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Payment Information</h3>
              </div>
              
              {hasDeposit ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Deposit Required:</span>
                    <span className="font-bold text-lg text-blue-900">${contract.depositAmount.toFixed(2)}</span>
                  </div>
                  {depositDeadline && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Deposit Due:</span>
                      <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded">
                        {depositDeadline}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Total Amount:</span>
                    <span className="font-semibold text-blue-800">${contract.totalAmount.toFixed(2)}</span>
                  </div>
                  {balanceDeadline && (
                    <div className="flex justify-between items-center pt-2 border-t border-blue-300">
                      <span className="text-sm text-gray-700">Balance Due:</span>
                      <div className="text-right">
                        <span className="font-semibold text-blue-800 block">
                          ${(contract.totalAmount - contract.depositAmount).toFixed(2)}
                        </span>
                        {balanceDeadline.formatted && (
                          <span className={`text-xs font-medium ${
                            balanceDeadline.overdue ? 'text-red-700 bg-red-50' : 
                            balanceDeadline.immediate ? 'text-orange-700 bg-orange-50' : 
                            'text-green-700 bg-green-50'
                          } px-2 py-1 rounded mt-1 inline-block`}>
                            {balanceDeadline.immediate ? 'Due: ' : balanceDeadline.overdue ? 'Overdue: ' : 'Due: '}
                            {balanceDeadline.formatted}
                            {balanceDeadline.days !== null && !balanceDeadline.immediate && !balanceDeadline.overdue && (
                              <span className="ml-1">({balanceDeadline.days} {balanceDeadline.days === 1 ? 'day' : 'days'})</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 p-2 bg-blue-100 rounded-md">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-700" />
                      <span className="text-sm font-medium text-blue-900">
                        Payment Required: <strong>On Sign</strong>
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      You'll be redirected to secure payment after signing.
                    </p>
                  </div>
                </div>
              ) : contract.totalAmount > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Total Amount:</span>
                    <span className="font-bold text-lg text-blue-900">${contract.totalAmount.toFixed(2)}</span>
                  </div>
                  {balanceDeadline && (
                    <div className="flex justify-between items-center pt-2 border-t border-blue-300">
                      <span className="text-sm text-gray-700">Payment Due:</span>
                      <span className={`text-xs font-semibold ${
                        balanceDeadline.overdue ? 'text-red-700 bg-red-50' : 
                        balanceDeadline.immediate ? 'text-orange-700 bg-orange-50' : 
                        'text-green-700 bg-green-50'
                      } px-2 py-1 rounded`}>
                        {balanceDeadline.immediate ? 'Due: ' : balanceDeadline.overdue ? 'Overdue: ' : 'Due: '}
                        {balanceDeadline.formatted}
                        {balanceDeadline.days !== null && !balanceDeadline.immediate && !balanceDeadline.overdue && (
                          <span className="ml-1">({balanceDeadline.days} {balanceDeadline.days === 1 ? 'day' : 'days'})</span>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="mt-3 p-2 bg-blue-100 rounded-md">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-700" />
                      <span className="text-sm font-medium text-blue-900">
                        Payment Required: <strong>After Signing</strong>
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      {balanceDeadline?.formatted 
                        ? `Payment will be due ${balanceDeadline.formatted}.`
                        : "Payment will be arranged after contract is signed."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-green-100 rounded-md">
                  <p className="text-sm font-medium text-green-900">
                    No payment required for this contract.
                  </p>
                </div>
              )}

              {/* Payment Terms */}
              {paymentTerms && (
                <div className="mt-3 pt-3 border-t border-blue-300">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Payment Terms:</p>
                  <p className="text-xs text-gray-600">{paymentTerms}</p>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-semibold text-gray-900 mb-2">What's Next?</p>
              <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                <li>Review the contract terms below</li>
                <li>Sign the contract with your name</li>
                {hasDeposit && <li>Complete secure payment</li>}
                <li>Receive confirmation</li>
              </ol>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowWelcomeDialog(false)} className="w-full">
              Got it, let's continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Security Header */}
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Secure Signing Link</p>
                  <p className="text-sm text-gray-600">This link is encrypted and secure</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-white">
                <Lock className="h-3 w-3 mr-1" />
                HTTPS Secure
              </Badge>
            </div>
          </CardContent>
        </Card>

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
                    {depositDeadline && (
                      <p className="text-xs text-orange-700 font-semibold mt-1 bg-orange-50 px-2 py-1 rounded inline-block">
                        Due: {depositDeadline}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-700 font-semibold mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-green-800">
                      ${contract.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Balance: ${(contract.totalAmount - contract.depositAmount).toFixed(2)}
                    </p>
                    {balanceDeadline && (
                      <p className={`text-xs font-semibold mt-1 px-2 py-1 rounded inline-block ${
                        balanceDeadline.overdue ? 'text-red-700 bg-red-50' : 
                        balanceDeadline.immediate ? 'text-orange-700 bg-orange-50' : 
                        'text-green-700 bg-green-50'
                      }`}>
                        Balance due: {balanceDeadline.formatted}
                        {balanceDeadline.days !== null && !balanceDeadline.immediate && !balanceDeadline.overdue && (
                          <span> ({balanceDeadline.days} {balanceDeadline.days === 1 ? 'day' : 'days'})</span>
                        )}
                      </p>
                    )}
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
