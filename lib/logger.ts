// Server-side logging using pino
// Structured logging for better observability

import pino from "pino";

// Determine log level from environment (default: info)
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug");

// Check if we're in Next.js environment (which doesn't support worker threads well)
// Next.js sets NEXT_RUNTIME environment variable
const isNextJS = typeof process !== "undefined" && (process.env.NEXT_RUNTIME || process.env.NEXT_PHASE);

// Create logger instance
// In Next.js, avoid pino-pretty transport (uses worker threads which cause issues)
// Use simple JSON output instead
const logger = pino({
  level: logLevel,
  // Only use pino-pretty in non-Next.js environments
  ...(process.env.NODE_ENV !== "production" && !isNextJS && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  }),
  // In Next.js dev mode, use simple formatting
  ...(process.env.NODE_ENV !== "production" && isNextJS && {
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
  // Redact sensitive fields in production
  redact: {
    paths: [
      "email",
      "password",
      "token",
      "signingToken",
      "signing_token",
      "apiKey",
      "secret",
      "signatureDataUrl",
    ],
    remove: process.env.NODE_ENV === "production",
  },
});

export default logger;

// Convenience methods for common log levels
export const log = {
  info: logger.info.bind(logger),
  error: logger.error.bind(logger),
  warn: logger.warn.bind(logger),
  debug: logger.debug.bind(logger),
  trace: logger.trace.bind(logger),
  fatal: logger.fatal.bind(logger),
  
  // Contextual logging helpers
  contract: (action: string, contractId: string, data?: Record<string, any>) => {
    logger.info({ action, contractId, ...data }, `Contract ${action}`);
  },
  
  payment: (action: string, paymentId: string, data?: Record<string, any>) => {
    logger.info({ action, paymentId, ...data }, `Payment ${action}`);
  },
  
  email: (action: string, to: string, data?: Record<string, any>) => {
    logger.info({ action, to, ...data }, `Email ${action}`);
  },
  
  auth: (action: string, userId?: string, data?: Record<string, any>) => {
    logger.info({ action, userId, ...data }, `Auth ${action}`);
  },
};

