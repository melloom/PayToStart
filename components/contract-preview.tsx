"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Contract } from "@/lib/types";

// Function to remove signature sections from contract content
function removeSignatureSections(content: string): string {
  if (!content) return content;
  
  // Only remove very specific signature block patterns
  // Pattern 1: SERVICE PROVIDER: followed by signature fields
  let cleanedContent = content.replace(
    /SERVICE\s+PROVIDER:\s*\n\s*Signature:\s*_{3,}\s*\n\s*Printed\s+Name:\s*\{\{providerPrintedName\}\}\s*\n\s*Title:\s*\{\{providerTitle\}\}\s*\n\s*Date:\s*_{3,}[\s\S]*?CLIENT:\s*\n\s*Signature:\s*_{3,}\s*\n\s*Printed\s+Name:\s*\{\{clientPrintedName\}\}\s*\n\s*Title:\s*\{\{clientTitle\}\}\s*\n\s*Date:\s*_{3,}/gi,
    ''
  );
  
  // Pattern 2: Just SERVICE PROVIDER section with signature fields
  cleanedContent = cleanedContent.replace(
    /SERVICE\s+PROVIDER:\s*\n\s*Signature:\s*_{3,}\s*\n\s*Printed\s+Name:\s*\{\{providerPrintedName\}\}\s*\n\s*Title:\s*\{\{providerTitle\}\}\s*\n\s*Date:\s*_{3,}/gi,
    ''
  );
  
  // Pattern 3: Just CLIENT section with signature fields
  cleanedContent = cleanedContent.replace(
    /CLIENT:\s*\n\s*Signature:\s*_{3,}\s*\n\s*Printed\s+Name:\s*\{\{clientPrintedName\}\}\s*\n\s*Title:\s*\{\{clientTitle\}\}\s*\n\s*Date:\s*_{3,}/gi,
    ''
  );
  
  // Pattern 4: Remove "SIGNATURES" section with equals signs (various formats)
  // Matches: ===...\nSIGNATURES\n===... or SIGNATURES\n===...
  cleanedContent = cleanedContent.replace(
    /={10,}\s*\n?\s*SIGNATURES\s*\n?\s*={10,}[\s\S]*?(?=\n\n(?:[A-Z][A-Z\s]{2,}:|$))/gi,
    ''
  );
  
  // Pattern 5: Remove "SIGNATURES" header followed by equals signs and any content until next section
  cleanedContent = cleanedContent.replace(
    /SIGNATURES\s*\n?\s*={10,}[\s\S]*?(?=\n\n(?:[A-Z][A-Z\s]{2,}:|$))/gi,
    ''
  );
  
  // Pattern 6: Remove equals signs line, then SIGNATURES, then equals signs line (all on separate lines)
  cleanedContent = cleanedContent.replace(
    /={10,}\s*\n\s*SIGNATURES\s*\n\s*={10,}[\s\S]*?(?=\n\n(?:[A-Z][A-Z\s]{2,}:|$))/gi,
    ''
  );
  
  // Pattern 6: Handle HTML content - look for specific signature blocks
  if (cleanedContent.includes('<')) {
    try {
      const parser = typeof window !== 'undefined' ? new DOMParser() : null;
      if (parser) {
        const doc = parser.parseFromString(cleanedContent, 'text/html');
        const body = doc.body;
        const text = body.textContent || '';
        
        // Remove signature sections including "SIGNATURES" headers
        const allElements = Array.from(body.querySelectorAll('*'));
        allElements.forEach((el) => {
          const elText = el.textContent || '';
          const elHtml = el.innerHTML || '';
          // Remove if it contains signature template variables or SIGNATURES header
          if (
            (elText.includes('SERVICE PROVIDER:') || elText.includes('CLIENT:')) &&
            (elHtml.includes('{{providerPrintedName}}') || elHtml.includes('{{clientPrintedName}}') || 
             elHtml.includes('{{providerTitle}}') || elHtml.includes('{{clientTitle}}'))
          ) {
            el.remove();
          }
          // Remove "SIGNATURES" headers with equals signs
          if (
            /SIGNATURES/i.test(elText) && 
            (/={3,}/.test(elText) || /={3,}/.test(elHtml))
          ) {
            el.remove();
          }
        });
        cleanedContent = body.innerHTML;
      }
    } catch (error) {
      // If parsing fails, return original content
      console.error('Error processing HTML content:', error);
    }
  }
  
  // Clean up multiple consecutive newlines
  cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n');
  
  return cleanedContent.trim();
}

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
  clientSignature?: {
    full_name: string;
    signature_url?: string | null;
    signed_at?: string;
  } | null;
  contractorSignature?: {
    full_name: string;
    signature_url?: string | null;
    signed_at?: string;
  } | null;
}

export function ContractPreview({
  contract,
  client,
  contractor,
  clientSignature,
  contractorSignature,
}: ContractPreviewProps) {
  // Remove signature sections from contract content
  const cleanedContent = contract.content ? removeSignatureSections(contract.content) : '';
  const isHTML = cleanedContent.includes('<') && cleanedContent.includes('>');
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-4xl mx-auto overflow-hidden w-full min-w-0" 
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
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{contractor.companyName}</h3>
          )}
          {contractor.companyAddress && (
            <p className="text-sm text-gray-600">{contractor.companyAddress}</p>
          )}
        </div>
      )}

      {/* Contract Title */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{contract.title}</h1>

      {/* Contract Agreement Header */}
      <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">CONTRACT AGREEMENT</h2>
      <p className="text-gray-900 dark:text-gray-100 mb-6">
        This contract is entered into on {format(new Date(contract.createdAt), "MMMM d, yyyy")}
      </p>

      {/* Parties Section */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Between:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
          <div className="break-words min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Contractor:</p>
            <p className="text-gray-900 dark:text-gray-100 break-words">
              {contractor.name}
              {contractor.companyName ? ` (${contractor.companyName})` : ""}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 break-all">{contractor.email}</p>
          </div>
          <div className="break-words min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Client:</p>
            <p className="text-gray-900 dark:text-gray-100 break-words">{client.name}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 break-all">{client.email}</p>
            {client.phone && (
              <p className="text-sm text-gray-700 dark:text-gray-300 break-all">{client.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Terms */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-4">SCOPE & PRICING</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-900 dark:text-gray-100">Total Contract Amount:</span>
            <span className="font-bold text-gray-900 dark:text-gray-100">${contract.totalAmount.toFixed(2)}</span>
          </div>
          {contract.depositAmount > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-900 dark:text-gray-100">Deposit Amount:</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">${contract.depositAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-300 dark:border-blue-600">
                <span className="font-bold text-gray-900 dark:text-gray-100">Remaining Balance:</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  ${(contract.totalAmount - contract.depositAmount).toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contract Content */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">CONTRACT TERMS AND CONDITIONS</h3>
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 overflow-hidden w-full min-w-0">
          <div 
            className="text-gray-900 dark:text-gray-100 leading-relaxed text-sm w-full min-w-0 contract-content-wrapper"
            style={{ 
              wordBreak: 'break-word', 
              overflowWrap: 'break-word',
              hyphens: 'auto',
              maxWidth: '100%',
              boxSizing: 'border-box',
              color: '#111827' // Force dark text for visibility
            }}
          >
            {cleanedContent && isHTML ? (
              <div 
                dangerouslySetInnerHTML={{ __html: cleanedContent }}
                style={{ color: '#111827' }}
                className="dark:text-gray-100"
              />
            ) : (
              <div 
                style={{ whiteSpace: 'pre-wrap', color: '#111827' }}
                className="dark:text-gray-100"
              >
                {cleanedContent}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signatures Section */}
      <div className="mt-12 pt-8 border-t-2 border-gray-300">
        <h3 className="text-lg font-bold text-white mb-6">SIGNATURES</h3>
        <p className="text-sm text-white mb-6">
          By signing below, both parties agree to the terms and conditions set forth in this contract.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Client Signature */}
          <div className="min-w-0 break-words">
            <p className="font-semibold text-white mb-2">Client Signature:</p>
            {clientSignature?.signature_url && clientSignature.signature_url.trim() !== "" ? (
              <>
                <div className="mb-2 border-2 border-gray-300 bg-white p-2 rounded">
                  <img
                    src={clientSignature.signature_url}
                    alt="Client Signature"
                    className="max-h-16 w-auto object-contain"
                  />
                </div>
                <p className="text-sm text-white break-words font-semibold">
                  {clientSignature.full_name || client.name}
                </p>
                <p className="text-xs text-white mt-1">
                  Date: {clientSignature.signed_at ? format(new Date(clientSignature.signed_at), "MMMM d, yyyy") : "_______________"}
                </p>
              </>
            ) : (
              <>
                <div className="border-b-2 border-gray-300 mb-2 h-12"></div>
                <p className="text-sm text-white break-words">{client.name}</p>
                <p className="text-xs text-white mt-1">Date: _______________</p>
              </>
            )}
          </div>

          {/* Contractor Signature */}
          <div className="min-w-0 break-words">
            <p className="font-semibold text-white mb-2">Contractor Signature:</p>
            {contractorSignature?.signature_url && contractorSignature.signature_url.trim() !== "" ? (
              <>
                <div className="mb-2 border-2 border-gray-300 bg-white p-2 rounded">
                  <img
                    src={contractorSignature.signature_url}
                    alt="Contractor Signature"
                    className="max-h-16 w-auto object-contain"
                  />
                </div>
                <p className="text-sm text-white break-words font-semibold">
                  {contractorSignature.full_name || contractor.name}
                </p>
                <p className="text-xs text-white mt-1">
                  Date: {contractorSignature.signed_at ? format(new Date(contractorSignature.signed_at), "MMMM d, yyyy") : "_______________"}
                </p>
              </>
            ) : (
              <>
                <div className="border-b-2 border-gray-300 mb-2 h-12"></div>
                <p className="text-sm text-white break-words">{contractor.name}</p>
                <p className="text-xs text-white mt-1">Date: _______________</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-300 text-center">
        <p className="text-xs text-white">
          Contract ID: {contract.id.slice(0, 8)}... | Generated on {format(new Date(), "MMMM d, yyyy")}
        </p>
      </div>
    </div>
  );
}
