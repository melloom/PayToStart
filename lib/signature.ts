// Signature utilities

import { createClient } from "./supabase-server";
import { storage } from "./storage";
import crypto from "crypto";

export interface SignatureData {
  fullName: string;
  signatureDataUrl: string | null;
  ip: string;
  userAgent: string;
  contractHash: string;
}

/**
 * Generate hash of contract content for integrity verification
 */
export function generateContractHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Convert data URL to Buffer
 */
export function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.split(",")[1];
  return Buffer.from(base64Data, "base64");
}

/**
 * Save signature to storage and database
 */
export async function saveSignature(
  contractId: string,
  companyId: string,
  clientId: string,
  signatureData: SignatureData
) {
  const supabase = await createClient();
  
  let signatureUrl: string | null = null;

  // Upload signature image if provided (using legacy bucket for now, will be moved to contracts bucket during finalization)
  if (signatureData.signatureDataUrl) {
    try {
      const buffer = dataUrlToBuffer(signatureData.signatureDataUrl);
      const fileName = `signature-${Date.now()}.png`;
      
      signatureUrl = await storage.uploadSignatureLegacy(
        contractId,
        companyId,
        clientId,
        buffer,
        fileName
      );
    } catch (uploadError: any) {
      console.error("Error uploading signature image:", uploadError);
      // If upload fails, continue without signature image - signature is optional
      // But log the error for debugging
      throw new Error(`Failed to upload signature image: ${uploadError.message || "Unknown error"}`);
    }
  }

  // Save signature record to database
  // Use service role client to bypass RLS (token is validated before this function is called)
  const { createServiceClient } = await import("./supabase/service");
  const serviceSupabase = createServiceClient();
  
  // Determine if this is a client or contractor signature
  const { data: clientCheck } = await serviceSupabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .maybeSingle();
  
  const isClientSignature = !!clientCheck;
  
  const insertData: any = {
    company_id: companyId,
    contract_id: contractId,
    signature_url: signatureUrl || "",
    signed_at: new Date().toISOString(),
    full_name: signatureData.fullName,
    ip_address: signatureData.ip,
    user_agent: signatureData.userAgent,
    contract_hash: signatureData.contractHash,
  };
  
  if (isClientSignature) {
    insertData.client_id = clientId;
    insertData.contractor_id = null;
  } else {
    insertData.client_id = null;
    insertData.contractor_id = clientId;
  }
  
  const { data, error } = await serviceSupabase
    .from("signatures")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Database error saving signature:", {
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      contractId,
      companyId,
      clientId,
    });
    throw new Error(`Failed to save signature to database: ${error.message}${error.details ? ` (${error.details})` : ""}`);
  }

  return data;
}

/**
 * Get signature for a contract
 */
export async function getSignature(contractId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("signatures")
    .select("*")
    .eq("contract_id", contractId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}


/**
 * Get all signatures for a contract (client and contractor)
 */
export async function getAllSignatures(contractId: string, contractClientId?: string, contractContractorId?: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("signatures")
    .select("*")
    .eq("contract_id", contractId)
    .order("signed_at", { ascending: true });

  if (error || !data || data.length === 0) {
    return { clientSignature: null, contractorSignature: null };
  }

  // Identify signatures by comparing client_id with contract's clientId and contractorId
  let clientSignature = null;
  let contractorSignature = null;

  if (contractClientId && contractContractorId) {
    // We have both IDs, so we can properly identify signatures
    // Client signature: where signature.client_id matches contract.clientId
    // Contractor signature: where signature.client_id matches contract.contractorId
    clientSignature = data.find((s: any) => s.client_id === contractClientId) || null;
    contractorSignature = data.find((s: any) => s.client_id === contractContractorId) || null;
  } else {
    // Fallback: assume first signature is client, second is contractor
    clientSignature = data[0] || null;
    contractorSignature = data.length > 1 ? data[1] : null;
  }

  return { clientSignature, contractorSignature };
}
