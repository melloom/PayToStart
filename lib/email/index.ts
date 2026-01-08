// Email sending using SMTP with nodemailer

import nodemailer from "nodemailer";

// Create reusable transporter for SMTP
const createTransporter = () => {
  // Check for SMTP credentials (support both Gmail and generic SMTP)
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPassword = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  
  // If no SMTP credentials, return null (will log in dev mode)
  if (!smtpUser || !smtpPassword) {
    return null;
  }

  // Default to Gmail if no SMTP_HOST is specified
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPassword, // SMTP password or Gmail App Password
    },
  });
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export async function sendEmail(options: EmailOptions) {
  const transporter = createTransporter();

  // Development mode: log email if no Gmail credentials
  if (!transporter) {
    console.log("=== EMAIL (Development Mode) ===");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("HTML:", options.html);
    if (options.attachments) {
      console.log("Attachments:", options.attachments.map(a => a.filename));
    }
    console.log("================================");
    return { success: true, id: "dev-mode" };
  }

  try {
    const mailOptions = {
      from: options.from || process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || "contracts@yourapp.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map((att) => ({
        filename: att.filename,
        content: typeof att.content === "string" 
          ? Buffer.from(att.content, "base64")
          : att.content,
        contentType: att.contentType || "application/pdf",
      })),
    };

    const info = await transporter.sendMail(mailOptions);

    return { success: true, id: info.messageId };
  } catch (error: any) {
    console.error("Error sending email:", error);
    throw error;
  }
}
