"use client";

import { useEffect, useState } from "react";

interface SignaturePollerProps {
  contractId: string;
  onSignaturesUpdate: (signatures: { clientSignature: any; contractorSignature: any }) => void;
  enabled?: boolean;
}

export function ContractSignaturePoller({
  contractId,
  onSignaturesUpdate,
  enabled = true,
}: SignaturePollerProps) {
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!enabled || !contractId) return;

    let intervalId: NodeJS.Timeout;
    let isMounted = true;

    const pollSignatures = async () => {
      if (isPolling) return;
      setIsPolling(true);

      try {
        const response = await fetch(`/api/contracts/${contractId}/signatures`);
        if (response.ok && isMounted) {
          const data = await response.json();
          onSignaturesUpdate({
            clientSignature: data.clientSignature,
            contractorSignature: data.contractorSignature,
          });
        }
      } catch (error) {
        console.error("Error polling signatures:", error);
      } finally {
        if (isMounted) {
          setIsPolling(false);
        }
      }
    };

    // Poll every 3 seconds
    intervalId = setInterval(pollSignatures, 3000);
    
    // Initial poll
    pollSignatures();

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [contractId, enabled, isPolling, onSignaturesUpdate]);

  return null;
}
