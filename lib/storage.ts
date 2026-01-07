// Supabase Storage utilities
import { createClient } from "./supabase-server";

export const storage = {
  // Upload final PDF to storage
  // Path: company/<companyId>/contracts/<contractId>/final.pdf
  async uploadPDF(contractId: string, companyId: string, file: File | Buffer): Promise<string> {
    const supabase = await createClient();
    const path = `company/${companyId}/contracts/${contractId}/final.pdf`;

    const { data, error } = await supabase.storage
      .from("contracts")
      .upload(path, file, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) throw error;

    // Get signed URL for private bucket
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("contracts")
      .createSignedUrl(path, 31536000); // 1 year expiration for final PDFs

    if (signedUrlError) throw signedUrlError;
    
    return signedUrlData.signedUrl;
  },

  // Upload signature image to contracts bucket
  // Path: company/<companyId>/contracts/<contractId>/signature.png
  async uploadSignature(
    contractId: string,
    companyId: string,
    file: File | Buffer
  ): Promise<string> {
    const supabase = await createClient();
    const path = `company/${companyId}/contracts/${contractId}/signature.png`;

    const { data, error } = await supabase.storage
      .from("contracts")
      .upload(path, file, {
        contentType: file instanceof File ? file.type : "image/png",
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw error;
    }

    // Get signed URL for private bucket
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("contracts")
      .createSignedUrl(path, 31536000); // 1 year expiration

    if (signedUrlError) throw signedUrlError;
    
    return signedUrlData.signedUrl;
  },

  // Upload attachment to contracts bucket
  // Path: company/<companyId>/contracts/<contractId>/attachments/<file>
  async uploadAttachment(
    contractId: string,
    companyId: string,
    file: File | Buffer,
    fileName: string,
    contentType: string
  ): Promise<string> {
    const supabase = await createClient();
    const path = `company/${companyId}/contracts/${contractId}/attachments/${fileName}`;

    const { data, error } = await supabase.storage
      .from("contracts")
      .upload(path, file, {
        contentType,
        upsert: true,
      });

    if (error) throw error;

    // Get signed URL for private bucket
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("contracts")
      .createSignedUrl(path, 31536000); // 1 year expiration

    if (signedUrlError) throw signedUrlError;
    
    return signedUrlData.signedUrl;
  },

  // Legacy upload signature (for backward compatibility during signing)
  // This still uses the old signatures bucket path structure
  async uploadSignatureLegacy(
    contractId: string,
    companyId: string,
    clientId: string,
    file: File | Buffer,
    fileName: string
  ): Promise<string> {
    const supabase = await createClient();
    const path = `${companyId}/${contractId}/${clientId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("signatures")
      .upload(path, file, {
        contentType: file instanceof File ? file.type : "image/png",
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw error;
    }

    // Get signed URL (for private bucket)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("signatures")
      .createSignedUrl(path, 3600);

    if (signedUrlError) throw signedUrlError;
    
    return signedUrlData.signedUrl;
  },

  // Delete file from storage
  async deleteFile(bucket: "contracts" | "signatures" | "attachments", path: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;
  },

  // Get signed URL for private files (valid for limited time)
  async getSignedUrl(
    bucket: "contracts" | "signatures" | "attachments",
    path: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  },
};

