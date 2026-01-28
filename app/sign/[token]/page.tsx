"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Loader2, Shield, Lock, CheckCircle2, DollarSign, CreditCard, Info, AlertCircle, X } from "lucide-react";
import { SignatureCanvas } from "@/components/signature/signature-canvas";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContractPreview } from "@/components/contract-preview";
import type { Contract, Client } from "@/lib/types";

// Function to check if content is HTML and strip inline styles if needed
function processContractContent(content: string): string {
  // If content doesn't contain HTML tags, return as-is (plain text)
  if (!content.includes('<') || !content.includes('>')) {
    return content;
  }
  
  // Content is HTML - strip inline styles to match preview styling
  if (typeof window === 'undefined') return content;
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Remove style and class attributes from all elements
    const allElements = doc.querySelectorAll('*');
    allElements.forEach((el) => {
      el.removeAttribute('style');
      el.removeAttribute('class');
    });
    
    return doc.body.innerHTML;
  } catch (error) {
    console.error('Error processing contract content:', error);
    return content;
  }
}

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
  const [contractor, setContractor] = useState<{
    name: string;
    email: string;
    companyName?: string;
    companyLogo?: string | null;
    companyAddress?: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [verifiedPassword, setVerifiedPassword] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [showPaymentConfirmationDialog, setShowPaymentConfirmationDialog] = useState(false);
  const [showPayInFullConfirmationDialog, setShowPayInFullConfirmationDialog] = useState(false);
  const [pendingCheckoutUrl, setPendingCheckoutUrl] = useState<string | null>(null);
  const [pendingPaymentAmount, setPendingPaymentAmount] = useState<number>(0);
  const [pendingPaymentDueDate, setPendingPaymentDueDate] = useState<string | null>(null);
  const [voidedContractPayments, setVoidedContractPayments] = useState<any[]>([]);
  const [voidedPaymentsLoaded, setVoidedPaymentsLoaded] = useState(false);
  
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
  
  // Process contract content - handle both HTML and plain text
  const processedContent = useMemo(() => {
    if (!contract?.content) return '';
    const processed = processContractContent(contract.content);
    // If it's HTML, return it for dangerouslySetInnerHTML
    // If it's plain text, return it for direct rendering
    return processed;
  }, [contract?.content]);
  
  // Check if content is HTML
  const isHTML = contract?.content?.includes('<') && contract?.content?.includes('>');

  useEffect(() => {
    // Prevent double fetch - only fetch if we don't have a contract yet
    if (contract || isLoading === false) return;
    
    let isMounted = true;
    
    async function fetchContract() {
      if (!params.token) {
        setIsLoading(false);
        toast({
          title: "Invalid Link",
          description: "The signing link is missing the contract token. Please check the URL.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Ensure token is properly encoded in URL
        const token = String(params.token);
        // Don't double-encode - Next.js already handles URL encoding
        // Just use the token directly
        const url = `/api/contracts/sign/${token}`;
        
        console.log('Fetching contract with token:', token.substring(0, 16) + '...');
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          if (data.contract) {
            setContract(data.contract);
            setClient(data.client);
            
            // Fetch contractor info for preview
            if (data.contract.contractorId) {
              try {
                const contractorUrl = `/api/contracts/${data.contract.id}/contractor`;
                console.log('Fetching contractor from:', contractorUrl);
                const contractorResponse = await fetch(contractorUrl);
                console.log('Contractor response status:', contractorResponse.status);
                
                if (contractorResponse.ok) {
                  const contractorData = await contractorResponse.json();
                  console.log('Contractor data received:', contractorData);
                  setContractor({
                    name: contractorData.name || "Contractor",
                    email: contractorData.email || "",
                    companyName: contractorData.companyName || undefined,
                    companyLogo: contractorData.companyLogo || null,
                    companyAddress: contractorData.companyAddress || null,
                  });
                } else {
                  const errorData = await contractorResponse.json().catch(() => ({ message: "Unknown error" }));
                  console.error("Contractor fetch failed:", errorData);
                  // Set default contractor info if fetch fails
                  setContractor({
                    name: "Contractor",
                    email: "",
                  });
                }
              } catch (error) {
                console.error("Error fetching contractor:", error);
                // Set default contractor info if fetch fails
                setContractor({
                  name: "Contractor",
                  email: "",
                });
              }
            } else {
              // Set default if no contractorId
              setContractor({
                name: "Contractor",
                email: "",
              });
            }
            
            // Show welcome dialog when contract loads
            setShowWelcomeDialog(true);
          } else {
            throw new Error("Contract data not found in response");
          }
        } else {
          const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
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
      } catch (error: any) {
        console.error("Error fetching contract:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load contract. Please check the link and try again.",
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchContract();
    
    // Show message if payment was canceled
    if (canceled === "1") {
      toast({
        title: "Payment Canceled",
        description: "Payment was canceled. You can try again when ready.",
        variant: "default",
      });
    }
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token]); // Only fetch when token changes

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

    // Check if signature is required but not provided
    if (requiresSignature && (!data.signatureDataUrl || data.signatureDataUrl.trim() === "")) {
      toast({
        title: "Signature Required",
        description: "Please draw your signature. A signature is required for this contract.",
        variant: "destructive",
      });
      return;
    }

    setIsSigning(true);
    try {
      // Get client IP and user agent
      const ipResponse = await fetch("/api/ip");
      const ipData = await ipResponse.json().catch(() => ({ ip: "unknown" }));

      // SECURITY: Include password in request body (not URL) if contract requires it
      const requestBody: any = {
        fullName: data.fullName.trim(),
        ip: ipData.ip || "unknown",
        userAgent: navigator.userAgent,
        agree: data.agree === true, // Must be exactly true
      };
      
      // Include signatureDataUrl if provided (or required)
      if (data.signatureDataUrl && data.signatureDataUrl.trim() !== "") {
        requestBody.signatureDataUrl = data.signatureDataUrl;
      } else if (requiresSignature) {
        // If signature is required but not provided, this should have been caught above
        // But add it here as a safety check
        toast({
          title: "Signature Required",
          description: "Please draw your signature before submitting.",
          variant: "destructive",
        });
        setIsSigning(false);
        return;
      }
      
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
        console.log("[SIGN] Signing successful, result:", result);
        
        // Check payment schedule to determine if immediate payment is required
        const paymentSchedule = (contract.fieldValues as any)?.paymentSchedule;
        const isPayUpfront = paymentSchedule === "upfront" && contract.depositAmount === 0 && contract.totalAmount > 0;
        const isPayInFull = paymentSchedule === "full" && contract.depositAmount === 0 && contract.totalAmount > 0;
        const requiresImmediatePayment = contract.depositAmount > 0 || isPayUpfront;
        
        if (requiresImmediatePayment) {
          // Deposit or upfront payment - show confirmation dialog for upfront, redirect immediately for deposit
          console.log("[SIGN] Immediate payment required. checkoutUrl:", result.checkoutUrl);
          
          if (isPayUpfront) {
            // Show confirmation dialog for "pay upfront" before redirecting
            setPendingCheckoutUrl(result.checkoutUrl);
            setPendingPaymentAmount(contract.totalAmount);
            setShowPaymentConfirmationDialog(true);
            toast({
              title: "Contract signed successfully!",
              description: "Please confirm payment to proceed.",
              duration: 2000,
            });
          } else if (isIncremental && isIncrementalPaymentDueNow) {
            // Incremental payment due now - redirect to payment immediately
            toast({
              title: "Contract signed successfully!",
              description: `First payment is due. Redirecting to payment...`,
              duration: 1000,
            });
            
            if (result.checkoutUrl) {
              // Redirect to Stripe Checkout immediately
              window.location.href = result.checkoutUrl;
            } else {
              // Fallback to payment page immediately
              window.location.href = `/pay/${params.token}`;
            }
          } else {
            // Deposit payment - redirect immediately (no confirmation needed)
            toast({
              title: "Contract signed successfully!",
              description: `Redirecting to payment page...`,
              duration: 1000,
            });
            
            if (result.checkoutUrl) {
              // Redirect to Stripe Checkout immediately
              window.location.href = result.checkoutUrl;
            } else {
              // Fallback to payment page immediately
              window.location.href = `/pay/${params.token}`;
            }
          }
        } else if (isPayInFull) {
          // Pay in full - show confirmation dialog with payment terms
          const paymentScheduleConfig = (contract.fieldValues as any)?.paymentScheduleConfig || {};
          const balanceDueDate = paymentScheduleConfig?.balanceDueDate;
          const customBalanceDueDate = paymentScheduleConfig?.customBalanceDueDate;
          let dueDateText = "Upon completion";
          
          if (balanceDueDate) {
            // Check if balanceDueDate is a date string (YYYY-MM-DD format) or a preset option
            const isDateString = /^\d{4}-\d{2}-\d{2}$/.test(balanceDueDate);
            
            if (isDateString) {
              // It's a custom date
              try {
                const customDate = new Date(balanceDueDate);
                dueDateText = customDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              } catch (e) {
                dueDateText = "As specified in agreement";
              }
            } else if (balanceDueDate === "upon_completion") {
              dueDateText = "Upon completion and acceptance";
            } else if (balanceDueDate === "within_7_days_completion") {
              dueDateText = "Within 7 days of completion";
            } else if (balanceDueDate === "within_14_days_completion") {
              dueDateText = "Within 14 days of completion";
            } else if (balanceDueDate === "net_15") {
              dueDateText = "Net 15 days after completion";
            } else if (balanceDueDate === "net_30") {
              dueDateText = "Net 30 days after completion";
            } else if (balanceDueDate === "custom") {
              // If it's set to "custom", check for customBalanceDueDate field
              if (customBalanceDueDate) {
                try {
                  const customDate = new Date(customBalanceDueDate);
                  dueDateText = customDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                } catch (e) {
                  dueDateText = "As specified in agreement";
                }
              } else {
                dueDateText = "As specified in agreement";
              }
            }
          }
          
          setPendingPaymentAmount(contract.totalAmount);
          setPendingPaymentDueDate(dueDateText);
          setShowPayInFullConfirmationDialog(true);
          
          toast({
            title: "Contract signed successfully!",
            description: "Please review payment terms.",
            duration: 2000,
          });
        } else if (isIncremental && !isIncrementalPaymentDueNow) {
          // Incremental payment with future first payment date - show confirmation dialog
          const firstPaymentDate = paymentScheduleConfig?.firstPaymentDate;
          const paymentAmount = paymentScheduleConfig?.paymentDates?.[0]?.amount || "0";
          const paymentFrequency = paymentScheduleConfig?.paymentFrequency || "monthly";
          
          let dueDateText = "As specified";
          if (firstPaymentDate) {
            try {
              const dueDate = new Date(firstPaymentDate);
              dueDateText = dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            } catch (e) {
              dueDateText = "As specified";
            }
          }
          
          const frequencyText = paymentFrequency === "weekly" ? "week" 
            : paymentFrequency === "biweekly" ? "2 weeks"
            : paymentFrequency === "monthly" ? "month"
            : "3 months";
          
          setPendingPaymentAmount(parseFloat(paymentAmount));
          setPendingPaymentDueDate(`First payment: ${dueDateText}. Amount: $${parseFloat(paymentAmount).toFixed(2)} per ${frequencyText}`);
          setShowPayInFullConfirmationDialog(true);
          
          toast({
            title: "Contract signed successfully!",
            description: "Please review payment schedule.",
            duration: 2000,
          });
        } else {
          // No payment required, finalize in background and redirect immediately
          toast({
            title: "Contract signed!",
            description: "Generating PDF...",
            duration: 1000,
          });
          
          // Start finalization but don't wait for it
          fetch(`/api/contracts/finalize/${params.token}`, {
            method: "POST",
          }).catch((err) => {
            console.error("[SIGN] Finalize error (non-blocking):", err);
          });
          
          // Redirect immediately - finalization happens in background
          window.location.href = `/sign/${params.token}/complete`;
        }
      } else {
        let errorMessage = "Failed to sign contract";
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
          // Show validation errors if present
          if (error.errors && Array.isArray(error.errors)) {
            const validationErrors = error.errors.map((e: any) => {
              const path = e.path ? e.path.join('.') : 'unknown';
              return `${path}: ${e.message || 'Invalid'}`;
            }).join(', ');
            if (validationErrors) {
              errorMessage = `Validation error: ${validationErrors}`;
            }
          }
        } catch (parseError) {
          errorMessage = `Server error (${response.status}). Please try again.`;
        }
        toast({
          title: "Error",
          description: errorMessage,
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Contract Not Found</CardTitle>
            <CardDescription>
              This contract link is invalid or has expired.
            </CardDescription>
            {params.token && (
              <p className="mt-2 text-xs text-muted-foreground">
                Token: {String(params.token).substring(0, 16)}...
              </p>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please check that you copied the complete link. If the problem persists, 
              contact the person who sent you this contract to request a new signing link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch payments for voided contract check
  useEffect(() => {
    if (contract?.status === "cancelled" && !voidedPaymentsLoaded && contract.id) {
      fetch(`/api/contracts/${contract.id}/payments`)
        .then(res => res.json())
        .then(data => {
          setVoidedContractPayments(data.payments || []);
          setVoidedPaymentsLoaded(true);
        })
        .catch(() => {
          setVoidedPaymentsLoaded(true);
        });
    }
  }, [contract?.status, contract?.id, voidedPaymentsLoaded]);

  // Check if contract is voided/cancelled
  if (contract.status === "cancelled") {
    const hasCompletedPayments = voidedContractPayments.some((p: any) => p.status === "completed");

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg border-2 border-red-200 shadow-2xl bg-white">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                <X className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
              Contract Has Been Voided
            </CardTitle>
            <CardDescription className="text-slate-600 text-lg">
              This contract is no longer active
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 p-6 rounded-xl">
              <div className="space-y-3">
                <p className="text-slate-700 font-medium">
                  This contract has been voided by the contractor and is no longer valid for signing.
                </p>
                {hasCompletedPayments && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <p className="text-sm font-medium text-green-800 mb-1">
                      <CheckCircle2 className="h-4 w-4 inline mr-2" />
                      Payment Refunded
                    </p>
                    <p className="text-xs text-green-700">
                      If you made any payments for this contract, they have been automatically refunded to your original payment method. 
                      Please allow 5-10 business days for the refund to appear in your account.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
              <p className="text-sm text-blue-900">
                <strong className="font-semibold">What should you do?</strong>
                <br />
                If you have questions about this contract or need assistance, please contact the contractor directly.
              </p>
            </div>

            {contractor && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                <p className="text-xs text-slate-600 mb-2">Contractor Information:</p>
                <p className="text-sm font-medium text-slate-900">{contractor.name}</p>
                {contractor.companyName && (
                  <p className="text-xs text-slate-600">{contractor.companyName}</p>
                )}
                {contractor.email && (
                  <p className="text-xs text-slate-600 mt-1">
                    <a href={`mailto:${contractor.email}`} className="text-blue-600 hover:underline">
                      {contractor.email}
                    </a>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (contract.status === "signed" || contract.status === "paid" || contract.status === "completed") {
    // Check if immediate payment is required (deposit or upfront, but NOT pay in full)
    const paymentSchedule = (contract.fieldValues as any)?.paymentSchedule;
    const isPayUpfront = paymentSchedule === "upfront" && contract.depositAmount === 0 && contract.totalAmount > 0;
    const requiresImmediatePayment = contract.depositAmount > 0 || isPayUpfront;
    
    // If signed but immediate payment is required, redirect to payment
    if (requiresImmediatePayment && contract.status === "signed") {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Contract Signed</CardTitle>
              <CardDescription>
                Redirecting to payment page...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push(`/pay/${params.token}`)}
                className="w-full"
              >
                Go to Payment Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    // If signed and no deposit, or completed, redirect to complete page
    if (contract.status === "signed" || contract.status === "paid" || contract.status === "completed") {
      router.push(`/sign/${params.token}/complete`);
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Redirecting to completion page...</p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Get payment information from contract metadata or fieldValues
  const paymentTerms = (contract as any)?.paymentTerms || (contract as any)?.fieldValues?.paymentTerms || "";
  const compensationType = (contract as any)?.compensationType || (contract as any)?.fieldValues?.compensationType || "";
  const paymentSchedule = (contract as any)?.fieldValues?.paymentSchedule || "";
  const paymentScheduleConfig = (contract as any)?.fieldValues?.paymentScheduleConfig || {};
  const requiresSignature = (contract as any)?.fieldValues?.requiresSignature !== false; // Default to true for backwards compatibility
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
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
              {client?.name ? `Hello ${client.name}!` : "Hello!"} You&apos;ve been invited to review and sign a contract.
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
                      You&apos;ll be redirected to secure payment after signing.
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
              <p className="text-sm font-semibold text-gray-900 mb-2">What&apos;s Next?</p>
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
              Got it, let&apos;s continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Security Header */}
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/20 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Secure Signing Link</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This link is encrypted and secure</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-white dark:bg-gray-800 dark:text-gray-100">
                <Lock className="h-3 w-3 mr-1" />
                HTTPS Secure
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Step A: Review */}
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Step A: Review Contract</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
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

            {/* Financial Summary */}
            {contract.depositAmount === 0 && (
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">${contract.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Preview - Below Step A */}
        {contract && (
          <div className="w-full my-6">
            <ContractPreview
              contract={contract}
              client={client || {
                name: contract.clientId || "Client",
                email: "",
                phone: undefined
              }}
              contractor={contractor || {
                name: "Contractor",
                email: "",
                companyName: undefined,
                companyLogo: null,
                companyAddress: null
              }}
            />
          </div>
        )}

        {/* Step B: Sign */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Step B: Sign Contract</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Sign the contract to proceed{contract.depositAmount > 0 ? " to payment" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-gray-900 dark:text-gray-100">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Payment Notice - Prominent Warning */}
              {hasDeposit && (
                <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-400 rounded-lg p-5 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-full flex-shrink-0">
                      <CreditCard className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Payment Required After Signing
                      </h3>
                      <div className="space-y-2 text-sm text-amber-800">
                        <p className="font-semibold">
                          A deposit of <strong className="text-lg">${contract.depositAmount.toFixed(2)}</strong> will be required immediately after you sign this contract.
                        </p>
                        <div className="bg-white/60 rounded p-3 mt-3">
                          <p className="font-medium mb-1">What happens next:</p>
                          <ol className="list-decimal list-inside space-y-1 text-xs">
                            <li>You&apos;ll sign the contract below</li>
                            <li>You&apos;ll be automatically redirected to a secure payment page</li>
                            <li>Complete payment using credit card, debit card, or other secure payment methods</li>
                            <li>Once payment is confirmed, the contract will be finalized</li>
                          </ol>
                        </div>
                        {contract.totalAmount > contract.depositAmount && (
                          <p className="text-xs mt-2 pt-2 border-t border-amber-300">
                            <strong>Total Contract Amount:</strong> ${contract.totalAmount.toFixed(2)} 
                            {contract.depositAmount < contract.totalAmount && (
                              <span> (Balance of ${(contract.totalAmount - contract.depositAmount).toFixed(2)} due later)</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Notice for contracts with payment after signing (no deposit) */}
              {!hasDeposit && contract.totalAmount > 0 && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-1">Payment Information</h3>
                      <p className="text-sm text-blue-800">
                        This contract has a total amount of <strong>${contract.totalAmount.toFixed(2)}</strong>.
                        {balanceDeadline?.formatted ? (
                          <span> Payment will be due {balanceDeadline.formatted}.</span>
                        ) : (
                          <span> Payment arrangements will be made after the contract is signed.</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Signature Section */}
              <div className="space-y-6">
                {/* Full Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-900 dark:text-gray-100">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Type your full name as signature"
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Signature Canvas - Show if signature is required, hide if not */}
                {requiresSignature && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-gray-900 dark:text-gray-100 text-base font-semibold">
                        Digital Signature <span className="text-red-500">*</span> (Required)
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Please draw your signature using your mouse or touchscreen. A signature is required to complete this contract.
                      </p>
                    </div>
                    <SignatureCanvas
                      onSignatureChange={handleSignatureChange}
                      value={signatureDataUrl || undefined}
                    />
                    {!signatureDataUrl && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Please draw your signature above. It is required to complete this contract.
                      </p>
                    )}
                  </div>
                )}
                {!requiresSignature && (
                  <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Note:</strong> This contract only requires you to type your name above. No signature drawing is needed.
                    </p>
                  </div>
                )}

                {/* Agreement Checkbox */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agree"
                    checked={agreeValue}
                    onCheckedChange={(checked) => setValue("agree", checked === true)}
                  />
                  <Label
                    htmlFor="agree"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-900 dark:text-gray-100"
                  >
                    I agree to the terms and conditions stated in this contract. By checking this box, I confirm that I have read, understood, and agree to be bound by all terms of this agreement.
                    {hasDeposit && (
                      <span className="block mt-1 font-semibold text-amber-700 dark:text-amber-400">
                        I understand that a deposit of ${contract.depositAmount.toFixed(2)} will be required immediately after signing.
                      </span>
                    )}
                  </Label>
                </div>
                {errors.agree && (
                  <p className="text-sm text-destructive">
                    {errors.agree.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="text-gray-900 dark:text-gray-100"
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
      
      {/* Payment Confirmation Dialog for Pay Upfront */}
      <Dialog open={showPaymentConfirmationDialog} onOpenChange={setShowPaymentConfirmationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              Payment Required
            </DialogTitle>
            <DialogDescription className="pt-2">
              Your contract has been signed successfully! To complete the process, payment is required.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Payment Amount:</span>
                <span className="text-2xl font-bold text-indigo-600">
                  ${pendingPaymentAmount.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                You will be redirected to a secure payment page to complete your payment.
              </p>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>You'll be redirected to a secure Stripe checkout page</li>
                  <li>Complete your payment using any major credit card</li>
                  <li>You'll receive a receipt via email immediately</li>
                  <li>Your contract will be finalized and emailed to you</li>
                </ul>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPaymentConfirmationDialog(false);
                setPendingCheckoutUrl(null);
                // Redirect to complete page - they can pay later
                window.location.href = `/sign/${params.token}/complete`;
              }}
            >
              Pay Later
            </Button>
            <Button
              onClick={() => {
                setShowPaymentConfirmationDialog(false);
                if (pendingCheckoutUrl) {
                  // Redirect to Stripe Checkout
                  window.location.href = pendingCheckoutUrl;
                } else {
                  // Fallback to payment page
                  window.location.href = `/pay/${params.token}`;
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Terms Confirmation Dialog for Pay in Full */}
      <Dialog open={showPayInFullConfirmationDialog} onOpenChange={setShowPayInFullConfirmationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Contract Signed - Payment Terms
            </DialogTitle>
            <DialogDescription className="pt-2">
              Your contract has been signed successfully! Please review the payment terms below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Full Payment Amount:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${pendingPaymentAmount.toFixed(2)}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-green-300">
                <p className="text-sm font-semibold text-gray-700 mb-1">Payment Due:</p>
                <p className="text-base text-gray-800 font-medium">
                  {pendingPaymentDueDate || "Upon completion"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Payment Agreement:</p>
                <p className="text-blue-800">
                  By proceeding, you acknowledge that you agree to pay the full amount of <strong>${pendingPaymentAmount.toFixed(2)}</strong> according to the terms specified in the contract ({pendingPaymentDueDate || "upon completion"}).
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-amber-800">
                  <li>You can pay when ready using the payment link</li>
                  <li>A payment link will be available on the completion page</li>
                  <li>You'll receive email reminders when payment is due</li>
                  <li>Once paid, the contract will be finalized with receipt</li>
                </ul>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => {
                setShowPayInFullConfirmationDialog(false);
                // Start finalization but don't wait for it
                fetch(`/api/contracts/finalize/${params.token}`, {
                  method: "POST",
                }).catch((err) => {
                  console.error("[SIGN] Finalize error (non-blocking):", err);
                });
                // Redirect to complete page - they can pay later
                window.location.href = `/sign/${params.token}/complete`;
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              I Understand & Agree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
