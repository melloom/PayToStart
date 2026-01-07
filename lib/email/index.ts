// Email sending using Gmail SMTP with nodemailer

import nodemailer from "nodemailer";

// Create reusable transporter for Gmail SMTP
const createTransporter = () => {
  // If no Gmail credentials, return null (will log in dev mode)
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
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
      from: options.from || process.env.GMAIL_USER || process.env.SMTP_FROM || "contracts@yourapp.com",
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
