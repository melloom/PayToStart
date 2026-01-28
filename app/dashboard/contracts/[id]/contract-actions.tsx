"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Send, Download, MessageSquare, Lock, Pen } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SignatureCanvas } from "@/components/signature/signature-canvas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ContractActions({
  contractId,
  clientEmail,
  signingUrl,
  contractStatus,
  hasClientSignature,
  hasContractorSignature,
  depositAmount,
  totalAmount,
  contractFieldValues,
}: {
  contractId: string;
  clientEmail: string;
  signingUrl: string;
  contractStatus?: string;
  hasClientSignature?: boolean;
  hasContractorSignature?: boolean;
  depositAmount?: number;
  totalAmount?: number;
  contractFieldValues?: Record<string, any>;
}) {
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showSMSDialog, setShowSMSDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [emailToSend, setEmailToSend] = useState(clientEmail);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [customPaymentMethod, setCustomPaymentMethod] = useState<string>("");
  // Get initial value from contract fieldValues, default to true for backwards compatibility
  const [requiresSignature, setRequiresSignature] = useState<boolean>(
    contractFieldValues?.requiresSignature !== false
  );
  
  // Check if contract has payment amounts
  const hasPayment = (depositAmount && depositAmount > 0) || (totalAmount && totalAmount > 0);

  const handleResend = async () => {
    // Validate email
    if (!emailToSend.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToSend.trim())) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Validate payment method if contract has payment amounts
    if (hasPayment) {
      if (!paymentMethod) {
        toast({
          title: "Payment Method Required",
          description: "Please select how the client will pay. If accepting cash or offline payment, select 'Cash/Offline Payment'.",
          variant: "destructive",
        });
        return;
      }
      if (paymentMethod === "other" && !customPaymentMethod.trim()) {
        toast({
          title: "Error",
          description: "Please specify the custom payment method",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate password if using one
    if (usePassword) {
      if (!password.trim()) {
        toast({
          title: "Error",
          description: "Please enter a password",
          variant: "destructive",
        });
        return;
      }
      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }
      if (password.length < 4) {
        toast({
          title: "Error",
          description: "Password must be at least 4 characters",
          variant: "destructive",
        });
        return;
      }
    }

    setIsResending(true);
    try {
      // Determine final payment method value
      const finalPaymentMethod = paymentMethod === "other" 
        ? customPaymentMethod.trim() 
        : paymentMethod;

      const response = await fetch(`/api/contracts/${contractId}/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: emailToSend.trim(),
          password: usePassword ? password : null,
          paymentMethod: hasPayment ? finalPaymentMethod : null,
          requiresSignature: requiresSignature, // Add signature requirement toggle
        }),
      });

      if (response.ok) {
        toast({
          title: "Email sent",
          description: usePassword 
            ? "Contract link with password protection has been sent to the client."
            : "Contract link has been sent to the client.",
        });
        setShowPasswordDialog(false);
        setPassword("");
        setConfirmPassword("");
        setUsePassword(false);
        setEmailToSend(clientEmail);
        setPaymentMethod("");
        setCustomPaymentMethod("");
        setRequiresSignature(contractFieldValues?.requiresSignature !== false); // Reset to contract value
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to send email",
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
      setIsResending(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/download-pdf`, {
        method: "GET",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contract-${contractId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "PDF downloaded",
          description: "Contract PDF has been generated and downloaded.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to generate PDF",
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
      setIsGeneratingPDF(false);
    }
  };

  const handleSendSMS = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSendingSMS(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phoneNumber: phoneNumber.trim(),
          signingUrl 
        }),
      });

      if (response.ok) {
        toast({
          title: "SMS sent",
          description: "Contract link has been sent via text message.",
        });
        setShowSMSDialog(false);
        setPhoneNumber("");
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to send SMS",
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
      setIsSendingSMS(false);
    }
  };

  // Hide send/resend email and SMS buttons after both parties have signed
  // Show them only for draft, ready, and sent statuses (before both sign)
  const bothSigned = hasClientSignature && hasContractorSignature;
  const showSendButtons = !bothSigned && contractStatus && 
    (contractStatus === "draft" || contractStatus === "ready" || contractStatus === "sent");

  return (
    <div className="space-y-2 w-full min-w-0">
      {showSendButtons && (
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogTrigger asChild>
            <Button
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Send / Resend Email
            </Button>
          </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Contract</DialogTitle>
            <DialogDescription>
              Send the contract link to the client. You can optionally add password protection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="emailToSend">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="emailToSend"
                  type="email"
                  placeholder="client@example.com"
                  value={emailToSend}
                  onChange={(e) => setEmailToSend(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                The email address where the contract will be sent
              </p>
            </div>

            {/* Payment Method Selection - Required if contract has payment amounts */}
            {hasPayment && (
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">
                  Payment Method <span className="text-red-500">*</span>
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select how client will pay" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Credit/Debit Card (Stripe)</SelectItem>
                    <SelectItem value="cash">Cash/Offline Payment</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer (ACH/Wire)</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="venmo">Venmo</SelectItem>
                    <SelectItem value="zelle">Zelle</SelectItem>
                    <SelectItem value="other">Other (specify below)</SelectItem>
                  </SelectContent>
                </Select>
                {paymentMethod === "other" && (
                  <Input
                    placeholder="Specify payment method (e.g., Cash App, Apple Pay)"
                    value={customPaymentMethod}
                    onChange={(e) => setCustomPaymentMethod(e.target.value)}
                    className="mt-2"
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  {paymentMethod === "cash" 
                    ? "Client will pay offline. No online payment processing will be set up."
                    : "This will be saved to the contract and shown to the client."}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresSignature"
                checked={requiresSignature}
                onCheckedChange={(checked) => setRequiresSignature(checked === true)}
              />
              <Label htmlFor="requiresSignature" className="cursor-pointer">
                Require signature (client must draw a signature - mandatory)
              </Label>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              {requiresSignature 
                ? "Client must type their name AND draw a signature. Signature drawing is mandatory."
                : "Client only needs to type their name to acknowledge the contract. No signature drawing required."}
            </p>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="usePassword"
                checked={usePassword}
                onCheckedChange={(checked) => setUsePassword(checked === true)}
              />
              <Label htmlFor="usePassword" className="cursor-pointer">
                Require password to view and sign contract
              </Label>
            </div>
            
            {usePassword && (
              <div className="space-y-4 pl-6 border-l-2 border-slate-700">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Client will need this password to access the contract
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword("");
                  setConfirmPassword("");
                  setUsePassword(false);
                  setEmailToSend(clientEmail);
                  setPaymentMethod("");
                  setCustomPaymentMethod("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResend}
                disabled={isResending || !emailToSend.trim() || (hasPayment && !paymentMethod)}
              >
                {isResending ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      )}
      
      {showSendButtons && (
        <Dialog open={showSMSDialog} onOpenChange={setShowSMSDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send via Text
            </Button>
          </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Contract via Text Message</DialogTitle>
            <DialogDescription>
              Enter the client's phone number to send the contract signing link via SMS.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +1 for US)
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSMSDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendSMS}
                disabled={isSendingSMS || !phoneNumber.trim()}
              >
                {isSendingSMS ? "Sending..." : "Send SMS"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      )}

      <Button
        onClick={handleDownloadPDF}
        disabled={isGeneratingPDF}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
      >
        <Download className="h-4 w-4 mr-2" />
        {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
      </Button>

      {/* Sign Contract Button - Show for all statuses (contractor can sign before or after client) */}
      {contractStatus && contractStatus !== "cancelled" && (
        <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-green-500 text-green-700 hover:bg-green-50"
              disabled={false}
            >
              <Pen className="h-4 w-4 mr-2" />
              {hasContractorSignature ? "Update Signature" : "Sign Contract"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{hasContractorSignature ? "Update Your Signature" : "Sign Contract"}</DialogTitle>
              <DialogDescription>
                {hasContractorSignature 
                  ? "You can update your signature. Note: Once the contract is sent, the contract content cannot be changed for legal reasons."
                  : "Add your signature to the contract. You can sign before or after sending it to the client."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Signature (Optional)</Label>
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                  <SignatureCanvas
                    onSignatureChange={setSignatureDataUrl}
                    value={signatureDataUrl}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Draw your signature above, or leave blank to sign with name only
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSignDialog(false);
                    setFullName("");
                    setSignatureDataUrl(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!fullName.trim()) {
                      toast({
                        title: "Error",
                        description: "Please enter your full name",
                        variant: "destructive",
                      });
                      return;
                    }

                    setIsSigning(true);
                    try {
                      const response = await fetch(`/api/contracts/${contractId}/contractor-sign`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          fullName: fullName.trim(),
                          signatureDataUrl: signatureDataUrl,
                        }),
                      });

                      if (response.ok) {
                        toast({
                          title: "Contract signed!",
                          description: "Your signature has been added to the contract.",
                        });
                        setShowSignDialog(false);
                        setFullName("");
                        setSignatureDataUrl(null);
                        // Refresh the page to show updated signature
                        window.location.reload();
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
                  }}
                  disabled={isSigning || !fullName.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSigning ? "Signing..." : "Sign Contract"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
