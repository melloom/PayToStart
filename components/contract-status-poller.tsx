"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Bell } from "lucide-react";

interface ContractStatusPollerProps {
  contractId: string;
  onStatusChange?: (status: string) => void;
  pollInterval?: number; // in milliseconds, default 5000 (5 seconds)
}

export function ContractStatusPoller({
  contractId,
  onStatusChange,
  pollInterval = 5000,
}: ContractStatusPollerProps) {
  const { toast } = useToast();
  const [lastStatus, setLastStatus] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!contractId || !isPolling) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/contracts/${contractId}/status`);
        if (response.ok) {
          const data = await response.json();
          const currentStatus = data.status;

          // Check if status changed
          if (lastStatus && lastStatus !== currentStatus) {
            // Status changed - notify user
            if (currentStatus === "signed") {
              toast({
                title: "Contract Signed!",
                description: "The contract has been signed by the client.",
                duration: 10000,
              });
            } else if (currentStatus === "paid") {
              toast({
                title: "Payment Received!",
                description: "The deposit payment has been received.",
                duration: 10000,
              });
            } else if (currentStatus === "completed") {
              toast({
                title: "Contract Completed!",
                description: "The contract has been fully completed.",
                duration: 10000,
              });
              // Stop polling when completed
              setIsPolling(false);
            }

            // Call callback if provided
            if (onStatusChange) {
              onStatusChange(currentStatus);
            }
          }

          setLastStatus(currentStatus);

          // Stop polling if contract is in final state
          if (["signed", "paid", "completed", "cancelled"].includes(currentStatus)) {
            setIsPolling(false);
          }
        }
      } catch (error) {
        console.error("Error polling contract status:", error);
      }
    };

    // Initial poll
    pollStatus();

    // Set up interval
    const interval = setInterval(pollStatus, pollInterval);

    return () => {
      clearInterval(interval);
    };
  }, [contractId, lastStatus, isPolling, pollInterval, onStatusChange, toast]);

  return null; // This component doesn't render anything
}
