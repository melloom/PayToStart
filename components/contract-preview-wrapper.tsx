"use client";

import { useState, useEffect } from "react";
import { ContractPreview } from "./contract-preview";
import { ContractSignaturePoller } from "./contract-signature-poller";
import type { Contract } from "@/lib/types";

interface ContractPreviewWrapperProps {
  contract: Contract;
  client: {
    name: string;
    email: string;
    phone?: string;
  };
  contractor: {
    name: string;
    email: string;
    companyName?: string;
    companyLogo?: string | null;
    companyAddress?: string | null;
  };
  initialClientSignature?: any;
  initialContractorSignature?: any;
}

export function ContractPreviewWrapper({
  contract,
  client,
  contractor,
  initialClientSignature,
  initialContractorSignature,
}: ContractPreviewWrapperProps) {
  const [clientSignature, setClientSignature] = useState(initialClientSignature);
  const [contractorSignature, setContractorSignature] = useState(initialContractorSignature);

  const handleSignaturesUpdate = (signatures: { clientSignature: any; contractorSignature: any }) => {
    setClientSignature(signatures.clientSignature);
    setContractorSignature(signatures.contractorSignature);
  };

  // Only poll if contract is signed/paid/completed (when signatures might be added)
  const shouldPoll = contract.status === "signed" || contract.status === "paid" || contract.status === "completed";

  return (
    <>
      {shouldPoll && (
        <ContractSignaturePoller
          contractId={contract.id}
          onSignaturesUpdate={handleSignaturesUpdate}
          enabled={shouldPoll}
        />
      )}
      <ContractPreview
        contract={contract}
        client={client}
        contractor={contractor}
        clientSignature={clientSignature}
        contractorSignature={contractorSignature}
      />
    </>
  );
}
