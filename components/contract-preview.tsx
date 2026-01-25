"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Contract } from "@/lib/types";

interface ContractPreviewProps {
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
}

export function ContractPreview({
  contract,
  client,
  contractor,
}: ContractPreviewProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl mx-auto overflow-hidden w-full min-w-0" 
      style={{ 
        fontFamily: "Georgia, serif", 
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Company Header */}
      {(contractor.companyLogo || contractor.companyName || contractor.companyAddress) && (
        <div className="mb-8 pb-6 border-b-2 border-gray-300">
          {contractor.companyLogo && (
            <img
              src={contractor.companyLogo}
              alt="Company Logo"
              className="mb-4"
              style={{ maxHeight: "60px", maxWidth: "150px" }}
            />
          )}
          {contractor.companyName && (
            <h3 className="text-lg font-bold text-gray-900 mb-2">{contractor.companyName}</h3>
          )}
          {contractor.companyAddress && (
            <p className="text-sm text-gray-600">{contractor.companyAddress}</p>
          )}
        </div>
      )}

      {/* Contract Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{contract.title}</h1>

      {/* Contract Agreement Header */}
      <h2 className="text-xl font-bold text-blue-600 mb-4">CONTRACT AGREEMENT</h2>
      <p className="text-gray-700 mb-6">
        This contract is entered into on {format(new Date(contract.createdAt), "MMMM d, yyyy")}
      </p>

      {/* Parties Section */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Between:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
          <div className="break-words min-w-0">
            <p className="font-semibold text-gray-900 mb-2">Contractor:</p>
            <p className="text-gray-700 break-words">
              {contractor.name}
              {contractor.companyName ? ` (${contractor.companyName})` : ""}
            </p>
            <p className="text-sm text-gray-600 mt-1 break-all">{contractor.email}</p>
          </div>
          <div className="break-words min-w-0">
            <p className="font-semibold text-gray-900 mb-2">Client:</p>
            <p className="text-gray-700 break-words">{client.name}</p>
            <p className="text-sm text-gray-600 mt-1 break-all">{client.email}</p>
            {client.phone && (
              <p className="text-sm text-gray-600 break-all">{client.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Terms */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold text-blue-900 mb-4">SCOPE & PRICING</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700">Total Contract Amount:</span>
            <span className="font-bold text-gray-900">${contract.totalAmount.toFixed(2)}</span>
          </div>
          {contract.depositAmount > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-700">Deposit Amount:</span>
                <span className="font-bold text-gray-900">${contract.depositAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-300">
                <span className="font-bold text-gray-900">Remaining Balance:</span>
                <span className="font-bold text-gray-900">
                  ${(contract.totalAmount - contract.depositAmount).toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contract Content */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-blue-600 mb-4">CONTRACT TERMS AND CONDITIONS</h3>
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 overflow-hidden w-full min-w-0">
          <div 
            className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap w-full min-w-0 contract-content-wrapper"
            style={{ 
              wordBreak: 'break-word', 
              overflowWrap: 'break-word',
              hyphens: 'auto',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            {contract.content}
          </div>
        </div>
      </div>

      {/* Signatures Section */}
      <div className="mt-12 pt-8 border-t-2 border-gray-300">
        <h3 className="text-lg font-bold text-gray-900 mb-6">SIGNATURES</h3>
        <p className="text-sm text-gray-600 mb-6">
          By signing below, both parties agree to the terms and conditions set forth in this contract.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Client Signature */}
          <div className="min-w-0 break-words">
            <p className="font-semibold text-gray-900 mb-2">Client Signature:</p>
            <div className="border-b-2 border-gray-400 mb-2 h-12"></div>
            <p className="text-sm text-gray-700 break-words">{client.name}</p>
            <p className="text-xs text-gray-500 mt-1">Date: _______________</p>
          </div>

          {/* Contractor Signature */}
          <div className="min-w-0 break-words">
            <p className="font-semibold text-gray-900 mb-2">Contractor Signature:</p>
            <div className="border-b-2 border-gray-400 mb-2 h-12"></div>
            <p className="text-sm text-gray-700 break-words">{contractor.name}</p>
            <p className="text-xs text-gray-500 mt-1">Date: _______________</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          Contract ID: {contract.id.slice(0, 8)}... | Generated on {format(new Date(), "MMMM d, yyyy")}
        </p>
      </div>
    </div>
  );
}
