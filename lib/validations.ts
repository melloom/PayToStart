// Zod validation schemas for contract management

import { z } from "zod";

/**
 * Template field schema
 */
export const templateFieldSchema = z.object({
  id: z.string().min(1, "Field ID is required"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["text", "number", "date", "textarea"]),
  required: z.boolean(),
  placeholder: z.string().optional(),
});

/**
 * Template creation/update schema
 */
export const templateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(200, "Template name too long"),
  content: z.string().min(1, "Template content is required"),
  fields: z.array(templateFieldSchema).default([]),
});

export type TemplateSchema = z.infer<typeof templateSchema>;
export type TemplateFieldSchema = z.infer<typeof templateFieldSchema>;

/**
 * Template variables validation
 * Validates the field values that fill in template variables
 */
export const templateVariablesSchema = z.record(
  z.string(), // field ID
  z.string() // field value
);

export type TemplateVariablesSchema = z.infer<typeof templateVariablesSchema>;

/**
 * Contract creation payload schema
 */
export const contractCreateSchema = z.object({
  // Client information (for new clients) - optional if clientId is provided
  clientName: z.string().max(200).optional(),
  clientEmail: z.string().email("Invalid email address").max(200).optional(),
  clientPhone: z.string().optional().nullable(),
  
  // Or use existing client
  clientId: z.string().uuid().optional(),
  
  // Template information (optional)
  templateId: z.string().uuid().optional().nullable(),
  
  // Template variables (if using a template) - accept any values
  fieldValues: z.record(z.string(), z.any()).optional().default({}),
  
  // Contract details
  title: z.string().min(1, "Contract title is required").max(500),
  content: z.string().min(1, "Contract content is required"),
  
  // Financial details - accept both string and number, default to 0
  depositAmount: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === '') return 0;
      const num = typeof val === 'string' ? parseFloat(val) : Number(val);
      return isNaN(num) ? 0 : num;
    },
    z.number().min(0, "Deposit must be non-negative").max(10000000, "Deposit amount too large")
  ).default(0),
  totalAmount: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === '') return 0;
      const num = typeof val === 'string' ? parseFloat(val) : Number(val);
      return isNaN(num) ? 0 : num;
    },
    z.number().min(0, "Total amount must be non-negative").max(10000000, "Total amount too large")
  ).default(0),
  
  // Additional optional fields that might be sent
  hasCompensation: z.boolean().optional(),
  compensationType: z.string().optional(),
  paymentTerms: z.string().optional().nullable(),
  paymentSchedule: z.enum(["upfront", "partial", "full", "split", "incremental"]).optional(),
  paymentScheduleConfig: z.record(z.any()).optional(),
}).refine(
  (data) => {
    // If deposit is provided, it should be less than or equal to total
    return data.depositAmount <= data.totalAmount;
  },
  {
    message: "Deposit amount cannot exceed total amount",
    path: ["depositAmount"],
  }
);

export type ContractCreateSchema = z.infer<typeof contractCreateSchema>;

/**
 * Signing payload schema
 */
export const signingPayloadSchema = z.object({
  fullName: z.string()
    .min(1, "Full name is required")
    .max(200, "Full name too long")
    .trim()
    .refine((val) => val.length >= 2, {
      message: "Full name must be at least 2 characters",
    }),
  signatureDataUrl: z.string()
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Optional
        // Validate it's a data URL with image
        if (!val.startsWith("data:image/") || !val.includes(";base64,")) {
          return false;
        }
        // Validate image type (only allow safe image types)
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
        const typeMatch = val.match(/data:image\/([^;]+)/);
        if (!typeMatch || !allowedTypes.includes(`image/${typeMatch[1]}`)) {
          return false;
        }
        // Validate base64 data exists
        const base64Match = val.match(/;base64,(.+)$/);
        if (!base64Match || !base64Match[1]) {
          return false;
        }
        // Check base64 data size (max 2MB)
        const estimatedSize = (base64Match[1].length * 3) / 4;
        if (estimatedSize > 2 * 1024 * 1024) {
          return false;
        }
        return true;
      },
      {
        message: "Signature must be a valid base64 image data URL (PNG, JPEG, or WebP, max 2MB)",
      }
    ),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  agree: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
});

export type SigningPayloadSchema = z.infer<typeof signingPayloadSchema>;

/**
 * Contract update schema (for status changes, etc.)
 */
export const contractUpdateSchema = z.object({
  status: z.enum(["draft", "sent", "signed", "paid", "completed", "cancelled"]).optional(),
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  depositAmount: z.coerce.number().min(0).max(10000000).optional(),
  totalAmount: z.coerce.number().min(0).max(10000000).optional(),
}).refine(
  (data) => {
    if (data.depositAmount !== undefined && data.totalAmount !== undefined) {
      return data.depositAmount <= data.totalAmount;
    }
    return true;
  },
  {
    message: "Deposit amount cannot exceed total amount",
    path: ["depositAmount"],
  }
);

export type ContractUpdateSchema = z.infer<typeof contractUpdateSchema>;

/**
 * Client creation schema
 */
export const clientCreateSchema = z.object({
  name: z.string().min(1, "Client name is required").max(200),
  email: z.string().email("Invalid email address").max(200),
  phone: z.string().optional().nullable(),
});

export type ClientCreateSchema = z.infer<typeof clientCreateSchema>;

/**
 * Resend email schema
 */
export const resendEmailSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
});

export type ResendEmailSchema = z.infer<typeof resendEmailSchema>;

