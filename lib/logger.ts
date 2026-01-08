// Server-side logging using pino
// Structured logging for better observability

import pino from "pino";

// Determine log level from environment (default: info)
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug");

// Create logger instance
const logger = pino({
  level: logLevel,
  ...(process.env.NODE_ENV !== "production" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
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

