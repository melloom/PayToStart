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
    const buffer = dataUrlToBuffer(signatureData.signatureDataUrl);
    const fileName = `signature-${Date.now()}.png`;
    
    signatureUrl = await storage.uploadSignatureLegacy(
      contractId,
      companyId,
      clientId,
      buffer,
      fileName
    );
  }

  // Save signature record to database
  // Use service role client to bypass RLS (token is validated before this function is called)
  const { createServiceClient } = await import("./supabase/service");
  const serviceSupabase = createServiceClient();
  
  const { data, error } = await serviceSupabase
    .from("signatures")
    .insert({
      company_id: companyId,
      contract_id: contractId,
      client_id: clientId,
      signature_url: signatureUrl || "",
      signed_at: new Date().toISOString(),
      full_name: signatureData.fullName,
      ip_address: signatureData.ip,
      user_agent: signatureData.userAgent,
      contract_hash: signatureData.contractHash,
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save signature: ${error.message}`);
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

