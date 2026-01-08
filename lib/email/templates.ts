// Email templates for contract lifecycle events
// Using Gmail SMTP for email delivery

export interface EmailTemplateData {
  contractTitle: string;
  contractorName: string;
  contractorEmail?: string;
  contractorCompany?: string;
  clientName: string;
  clientEmail: string;
  signingUrl?: string;
  depositAmount?: number;
  totalAmount?: number;
  pdfUrl?: string;
  paymentUrl?: string;
}

/**
 * Contract link email - sent when contract is sent to client
 * Subject: "Review & sign your agreement"
 */
export function getContractLinkEmail(data: EmailTemplateData): { subject: string; html: string } {
  const subject = "Review & sign your agreement";
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Review & Sign Your Agreement</h1>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.clientName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            You have been requested to review and sign the following agreement:
          </p>
          
          <div style="background: #f8f9fa; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
              ${data.contractTitle}
            </p>
            ${data.contractorCompany ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">From: ${data.contractorName}${data.contractorCompany ? ` (${data.contractorCompany})` : ""}</p>` : ""}
          </div>
          
          ${data.totalAmount ? `
          <div style="background: #fef3c7; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Contract Amount:</strong> $${data.totalAmount.toFixed(2)}
              ${data.depositAmount && data.depositAmount > 0 ? `<br><strong>Deposit Required:</strong> $${data.depositAmount.toFixed(2)}` : ""}
            </p>
          </div>
          ` : ""}
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.signingUrl || '#'}" 
               style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
              Review & Sign
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Or copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f9fafb; padding: 10px; border-radius: 4px;">
            ${data.signingUrl || ''}
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px;">
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              If you have any questions, please contact ${data.contractorName}${data.contractorEmail ? ` at ${data.contractorEmail}` : ""}.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Signed but unpaid email - sent when contract is signed but deposit is still needed
 * Subject: "Deposit needed to confirm"
 */
export function getSignedButUnpaidEmail(data: EmailTemplateData): { subject: string; html: string } {
  const subject = "Deposit needed to confirm";
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">Deposit Needed to Confirm</h1>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.clientName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thank you for signing the agreement <strong>"${data.contractTitle}"</strong>. 
            To proceed with the contract, please complete your deposit payment.
          </p>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #92400e;">
              Deposit Amount: $${data.depositAmount?.toFixed(2) || "0.00"}
            </p>
            ${data.totalAmount ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #78350f;">Total Contract Amount: $${data.totalAmount.toFixed(2)}</p>` : ""}
          </div>
          
          ${data.paymentUrl ? `
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.paymentUrl}" 
               style="display: inline-block; background: #f59e0b; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);">
              Pay Deposit Now
            </a>
          </div>
          ` : ""}
          
          <div style="background: #f0f9ff; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Next Steps:</strong> Once your deposit is received, the contract will be finalized and both parties will receive the final contract PDF.
            </p>
          </div>
          
          ${data.paymentUrl ? `
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Or copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f9fafb; padding: 10px; border-radius: 4px;">
            ${data.paymentUrl}
          </p>
          ` : ""}
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px;">
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              If you have any questions, please contact ${data.contractorName}${data.contractorEmail ? ` at ${data.contractorEmail}` : ""}.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Deposit received email - sent to both parties when payment is received and contract is finalized
 * Subject: "Deposit received"
 */
export function getDepositReceivedEmail(
  data: EmailTemplateData,
  isClient: boolean
): { subject: string; html: string } {
  const subject = "Deposit received";
  
  const recipientName = isClient ? data.clientName : data.contractorName;
  const otherPartyName = isClient ? data.contractorName : data.clientName;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #16a34a; margin: 0; font-size: 28px;">✅ Deposit Received</h1>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">Hello ${recipientName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Great news! The deposit for <strong>"${data.contractTitle}"</strong> has been received and the contract has been finalized.
          </p>
          
          <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-size: 14px; color: #166534; font-weight: 600;">Contract Details</p>
              <p style="margin: 5px 0 0 0; font-size: 16px; color: #111827;">
                <strong>Contract:</strong> ${data.contractTitle}
              </p>
              <p style="margin: 5px 0 0 0; font-size: 16px; color: #111827;">
                <strong>${isClient ? 'Contractor' : 'Client'}:</strong> ${otherPartyName}
              </p>
            </div>
            <div style="border-top: 1px solid #86efac; padding-top: 15px; margin-top: 15px;">
              <p style="margin: 0; font-size: 18px; font-weight: 600; color: #166534;">
                Deposit: $${data.depositAmount?.toFixed(2) || "0.00"}
              </p>
              ${data.totalAmount ? `<p style="margin: 5px 0 0 0; font-size: 14px; color: #15803d;">Total Contract Amount: $${data.totalAmount.toFixed(2)}</p>` : ""}
            </div>
          </div>
          
          ${data.pdfUrl ? `
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.pdfUrl}" 
               style="display: inline-block; background: #16a34a; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);">
              Download Final Contract PDF
            </a>
          </div>
          ` : ""}
          
          <div style="background: #f0f9ff; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>📄 Final Contract:</strong> Your final contract PDF is ready for download. This document includes your signature, payment confirmation, and all contract terms. Please save a copy for your records.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px;">
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              Thank you for your business!
            </p>
            ${isClient && data.contractorEmail ? `
            <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">
              If you have any questions, please contact ${data.contractorName} at ${data.contractorEmail}.
            </p>
            ` : ""}
          </div>
        </div>
      </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Reminder email - sent to remind client to sign
 * Subject: "Just a reminder to sign your agreement"
 */
export function getReminderEmail(data: EmailTemplateData): { subject: string; html: string } {
  const subject = "Just a reminder to sign your agreement";
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0; font-size: 28px;">Reminder: Sign Your Agreement</h1>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.clientName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            This is a friendly reminder that you have a pending agreement to review and sign:
          </p>
          
          <div style="background: #f8f9fa; border-left: 4px solid #6366f1; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
              ${data.contractTitle}
            </p>
            ${data.contractorCompany ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">From: ${data.contractorName}${data.contractorCompany ? ` (${data.contractorCompany})` : ""}</p>` : ""}
          </div>
          
          ${data.totalAmount ? `
          <div style="background: #fef3c7; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Contract Amount:</strong> $${data.totalAmount.toFixed(2)}
              ${data.depositAmount && data.depositAmount > 0 ? `<br><strong>Deposit Required:</strong> $${data.depositAmount.toFixed(2)}` : ""}
            </p>
          </div>
          ` : ""}
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.signingUrl || '#'}" 
               style="display: inline-block; background: #6366f1; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);">
              Review & Sign Now
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Or copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f9fafb; padding: 10px; border-radius: 4px;">
            ${data.signingUrl || ''}
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px;">
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              If you have any questions, please contact ${data.contractorName}${data.contractorEmail ? ` at ${data.contractorEmail}` : ""}.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return { subject, html };
}

