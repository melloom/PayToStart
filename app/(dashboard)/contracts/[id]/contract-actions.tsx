"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Send, Download } from "lucide-react";

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

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clientEmail }),
      });

      if (response.ok) {
        toast({
          title: "Email sent",
          description: "Contract link has been sent to the client.",
        });
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

  return (
    <div className="space-y-2">
      <Button
        onClick={handleResend}
        disabled={isResending}
        variant="outline"
        className="w-full"
      >
        <Send className="h-4 w-4 mr-2" />
        {isResending ? "Sending..." : "Resend Link"}
      </Button>
      <Button
        asChild
        variant="outline"
        className="w-full"
      >
        <a href={`mailto:${clientEmail}?subject=Contract Signing&body=Please sign the contract at: ${signingUrl}`}>
          <Mail className="h-4 w-4 mr-2" />
          Email Client
        </a>
      </Button>
      <Button
        onClick={handleDownloadPDF}
        disabled={isGeneratingPDF}
        variant="outline"
        className="w-full"
      >
        <Download className="h-4 w-4 mr-2" />
        {isGeneratingPDF ? "Generating..." : "Download PDF"}
      </Button>
    </div>
  );
}

