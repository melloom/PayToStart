"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Send, Download, MessageSquare, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function ContractActions({
  contractId,
  clientEmail,
  signingUrl,
}: {
  contractId: string;
  clientEmail: string;
  signingUrl: string;
}) {
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showSMSDialog, setShowSMSDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [emailToSend, setEmailToSend] = useState(clientEmail);

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
      const response = await fetch(`/api/contracts/${contractId}/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: emailToSend.trim(),
          password: usePassword ? password : null,
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

  return (
    <div className="space-y-2 w-full min-w-0">
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
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResend}
                disabled={isResending || !emailToSend.trim()}
              >
                {isResending ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
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

      <Button
        onClick={handleDownloadPDF}
        disabled={isGeneratingPDF}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
      >
        <Download className="h-4 w-4 mr-2" />
        {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
      </Button>
    </div>
  );
}
