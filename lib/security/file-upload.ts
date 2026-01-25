// File upload security validation

import {
  isValidFileType,
  isValidFileExtension,
  isValidFileSize,
  sanitizeFileName,
} from "./validation";

export interface FileUploadValidationOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  requireMimeType?: boolean;
}

export interface FileUploadValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedFileName?: string;
}

/**
 * Validate file upload for security
 */
export function validateFileUpload(
  file: {
    name: string;
    size: number;
    type?: string;
  },
  options: FileUploadValidationOptions = {}
): FileUploadValidationResult {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedMimeTypes = [],
    allowedExtensions = [],
    requireMimeType = false,
  } = options;

  const errors: string[] = [];

  // Validate file name
  if (!file.name || typeof file.name !== "string") {
    errors.push("Invalid file name");
    return { valid: false, errors };
  }

  // Sanitize file name
  const sanitizedFileName = sanitizeFileName(file.name);

  // Validate file size
  if (!isValidFileSize(file.size, maxSize)) {
    errors.push(`File size exceeds maximum allowed size of ${maxSize} bytes`);
  }

  // Validate MIME type if provided
  if (file.type) {
    if (allowedMimeTypes.length > 0 && !isValidFileType(file.type, allowedMimeTypes)) {
      errors.push(`File type ${file.type} is not allowed`);
    }
  } else if (requireMimeType) {
    errors.push("File MIME type is required");
  }

  // Validate file extension
  if (allowedExtensions.length > 0) {
    if (!isValidFileExtension(file.name, allowedExtensions)) {
      errors.push(`File extension is not allowed. Allowed: ${allowedExtensions.join(", ")}`);
    }
  }

  // Check for dangerous file types
  const dangerousExtensions = [
    ".exe", ".bat", ".cmd", ".com", ".pif", ".scr", ".vbs", ".js", ".jar",
    ".app", ".deb", ".pkg", ".rpm", ".sh", ".ps1", ".dll", ".so", ".dylib",
  ];
  
  const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
  if (dangerousExtensions.includes(fileExt)) {
    errors.push("Executable files are not allowed");
  }

  // Check for dangerous MIME types
  const dangerousMimeTypes = [
    "application/x-msdownload",
    "application/x-executable",
    "application/x-sh",
    "application/x-shellscript",
    "application/x-msdos-program",
    "application/x-ms-installer",
  ];

  if (file.type && dangerousMimeTypes.includes(file.type)) {
    errors.push("Executable file types are not allowed");
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedFileName: errors.length === 0 ? sanitizedFileName : undefined,
  };
}

/**
 * Validate image file upload
 */
export function validateImageUpload(
  file: {
    name: string;
    size: number;
    type?: string;
  },
  maxSize: number = 5 * 1024 * 1024 // 5MB default
): FileUploadValidationResult {
  return validateFileUpload(file, {
    maxSize,
    allowedMimeTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
    requireMimeType: true,
  });
}

/**
 * Validate document file upload
 */
export function validateDocumentUpload(
  file: {
    name: string;
    size: number;
    type?: string;
  },
  maxSize: number = 10 * 1024 * 1024 // 10MB default
): FileUploadValidationResult {
  return validateFileUpload(file, {
    maxSize,
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ],
    allowedExtensions: [".pdf", ".doc", ".docx", ".txt"],
    requireMimeType: true,
  });
}
