// Email templates for contract lifecycle events
// Using Gmail SMTP for email delivery

// Contact email for support inquiries
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "contact@mellowsites.com";

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
  isProposal?: boolean; // Whether this is a proposal (contractor pays client)
  upfrontOfferAmount?: number; // Upfront payment offer amount (for proposals)
}

/**
 * Contract link email - sent when contract is sent to client
 * Subject: "Review & sign your agreement"
 */
export function getContractLinkEmail(data: EmailTemplateData): { subject: string; html: string } {
  const subject = data.isProposal ? "Review & accept your proposal" : "Review & sign your agreement";
  
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
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">${data.isProposal ? "Review & Accept Your Proposal" : "Review & Sign Your Agreement"}</h1>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.clientName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            ${data.isProposal 
              ? `You have received a proposal with compensation offer from ${data.contractorName}:`
              : "You have been requested to review and sign the following agreement:"
            }
          </p>
          
          <div style="background: #f8f9fa; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
              ${data.contractTitle}
            </p>
            ${data.contractorCompany ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">From: ${data.contractorName}${data.contractorCompany ? ` (${data.contractorCompany})` : ""}</p>` : ""}
          </div>
          
          ${data.isProposal && data.upfrontOfferAmount ? `
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
            <div style="text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #ffffff; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                🎁 Upfront Payment Offer
              </p>
              <p style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff;">
                $${data.upfrontOfferAmount.toFixed(2)}
              </p>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #d1fae5;">
                This upfront payment will be sent to you upon acceptance of this proposal
              </p>
            </div>
          </div>
          ` : ""}
          ${data.totalAmount ? `
          <div style="background: #fef3c7; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>${data.isProposal ? "Total Compensation Offer" : "Contract Amount"}:</strong> $${data.totalAmount.toFixed(2)}
              ${data.depositAmount && data.depositAmount > 0 ? `<br><strong>${data.isProposal ? "Initial Payment" : "Deposit Required"}:</strong> $${data.depositAmount.toFixed(2)}` : ""}
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
              If you have any questions, please contact us at ${CONTACT_EMAIL}.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Signed but unpaid email - sent when contract is signed but payment is still needed
 * Subject: "Payment needed to confirm" or "Deposit needed to confirm"
 */
export function getSignedButUnpaidEmail(data: EmailTemplateData & { isUpfront?: boolean }): { subject: string; html: string } {
  const isUpfront = data.isUpfront || (data.depositAmount === data.totalAmount && data.depositAmount > 0);
  const subject = isUpfront ? "Payment needed to confirm" : "Deposit needed to confirm";
  const paymentLabel = isUpfront ? "Full Payment" : "Deposit";
  const paymentButtonText = isUpfront ? "Pay Now" : "Pay Deposit Now";
  
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
            <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">${paymentLabel} Needed to Confirm</h1>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.clientName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thank you for signing the agreement <strong>"${data.contractTitle}"</strong>. 
            To proceed with the contract, please complete your ${isUpfront ? "full payment" : "deposit payment"}.
          </p>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #92400e;">
              ${paymentLabel} Amount: $${data.depositAmount?.toFixed(2) || "0.00"}
            </p>
            ${data.totalAmount && !isUpfront ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #78350f;">Total Contract Amount: $${data.totalAmount.toFixed(2)}</p>` : ""}
          </div>
          
          ${data.paymentUrl ? `
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.paymentUrl}" 
               style="display: inline-block; background: #f59e0b; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);">
              ${paymentButtonText}
            </a>
          </div>
          ` : ""}
          
          <div style="background: #f0f9ff; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Next Steps:</strong> Once your ${isUpfront ? "payment" : "deposit"} is received, the contract will be finalized and both parties will receive the final contract PDF ${isUpfront ? "with receipt" : ""}.
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
              If you have any questions, please contact us at ${CONTACT_EMAIL}.
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
            ${isClient ? `
            <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">
              If you have any questions, please contact us at ${CONTACT_EMAIL}.
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
/**
 * Contract signed email - sent to contractor when client signs the contract
 * Subject: "Contract signed by client"
 */
export function getContractSignedEmail(data: EmailTemplateData): { subject: string; html: string } {
  const subject = "Contract signed by client";
  
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
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">✅ Contract Signed</h1>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.contractorName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Great news! <strong>${data.clientName}</strong> has signed the contract:
          </p>
          
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
              ${data.contractTitle}
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
              Signed by: ${data.clientName}
            </p>
            ${data.totalAmount ? `
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
              Amount: $${data.totalAmount.toFixed(2)}
              ${data.depositAmount && data.depositAmount > 0 ? ` (Deposit: $${data.depositAmount.toFixed(2)})` : ""}
            </p>
            ` : ""}
          </div>
          
          ${data.depositAmount && data.depositAmount > 0 ? `
          <div style="background: #fef3c7; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Next Step:</strong> The client will receive a payment link to complete the deposit. Once payment is received, the contract will be finalized.
            </p>
          </div>
          ` : `
          <div style="background: #f0fdf4; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #166534;">
              <strong>Status:</strong> Contract is signed and ready. ${data.depositAmount === 0 ? "No deposit required." : ""}
            </p>
          </div>
          `}
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px;">
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              You can view the contract details in your dashboard.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return { subject, html };
}

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
              If you have any questions, please contact us at ${CONTACT_EMAIL}.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return { subject, html };
}


/**
 * Remaining balance due email - sent when remaining balance is due
 * Subject: "Payment due: Remaining balance for [Contract Title]"
 */
export function getRemainingBalanceDueEmail(data: EmailTemplateData & { remainingBalance: number }): { subject: string; html: string } {
  const subject = `Payment due: Remaining balance for ${data.contractTitle}`;
  
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
            <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">Payment Due</h1>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.clientName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            This is a reminder that the remaining balance for your contract is now due:
          </p>
          
          <div style="background: #f8f9fa; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
              ${data.contractTitle}
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
              From: ${data.contractorName}${data.contractorCompany ? ` (${data.contractorCompany})` : ""}
            </p>
          </div>
          
          <div style="background: #fef3c7; border-radius: 6px; padding: 20px; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; font-size: 16px; color: #92400e; font-weight: 600;">
              Remaining Balance Due:
            </p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; color: #92400e;">
              $${data.remainingBalance.toFixed(2)}
            </p>
            ${data.totalAmount ? `
            <p style="margin: 15px 0 0 0; font-size: 14px; color: #92400e;">
              Total Contract Amount: $${data.totalAmount.toFixed(2)}
            </p>
            ` : ""}
          </div>
          
          ${data.paymentUrl ? `
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.paymentUrl}" 
               style="display: inline-block; background: #f59e0b; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);">
              Pay Remaining Balance Now
            </a>
          </div>
          ` : ""}
          
          <div style="background: #f0f9ff; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Important:</strong> Please complete payment to finalize your contract. Once payment is received, you'll receive a receipt and finalized contract PDF.
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
              If you have any questions or need to discuss payment arrangements, please contact ${data.contractorName}${data.contractorEmail ? ` at ${data.contractorEmail}` : ""} or reach out to us at ${CONTACT_EMAIL}.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Payment received email - sent to both parties when any payment is received
 * Subject varies by payment type
 */
export function getPaymentReceivedEmail(
  data: EmailTemplateData & { 
    paymentAmount: number;
    paymentType: "deposit" | "full_payment" | "split_payment" | "incremental_payment" | "remaining_balance";
    paymentNumber?: number;
    totalPayments?: number;
    receiptUrl?: string;
    remainingBalance?: number;
  },
  isClient: boolean
): { subject: string; html: string } {
  const recipientName = isClient ? data.clientName : data.contractorName;
  const otherPartyName = isClient ? data.contractorName : data.clientName;
  
  // Determine subject and payment description based on type
  let subject: string;
  let paymentDescription: string;
  let paymentLabel: string;
  
  switch (data.paymentType) {
    case "full_payment":
      subject = "Full Payment Received";
      paymentDescription = "Full payment";
      paymentLabel = "Full Payment";
      break;
    case "split_payment":
      subject = `Payment ${data.paymentNumber}${data.totalPayments ? ` of ${data.totalPayments}` : ""} Received`;
      paymentDescription = `Payment ${data.paymentNumber}${data.totalPayments ? ` of ${data.totalPayments}` : ""}`;
      paymentLabel = `Split Payment ${data.paymentNumber}`;
      break;
    case "incremental_payment":
      subject = `Payment ${data.paymentNumber || ""} Received`;
      paymentDescription = `Incremental payment ${data.paymentNumber || ""}`;
      paymentLabel = `Payment ${data.paymentNumber || ""}`;
      break;
    case "remaining_balance":
      subject = "Remaining Balance Received";
      paymentDescription = "Remaining balance";
      paymentLabel = "Remaining Balance";
      break;
    default:
      subject = "Deposit Received";
      paymentDescription = "Deposit";
      paymentLabel = "Deposit";
  }
  
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
            <h1 style="color: #16a34a; margin: 0; font-size: 28px;">✅ ${subject}</h1>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">Hello ${recipientName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            ${isClient 
              ? `Your ${paymentDescription.toLowerCase()} for the contract has been successfully processed.`
              : `The ${paymentDescription.toLowerCase()} for the contract has been received from ${otherPartyName}.`
            }
          </p>
          
          <div style="background: #f8f9fa; border-left: 4px solid #16a34a; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
              ${data.contractTitle}
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
              ${isClient ? 'Contractor' : 'Client'}: ${otherPartyName}
            </p>
          </div>
          
          <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-size: 14px; color: #166534; font-weight: 600;">Payment Details</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: 600; color: #166534;">
                ${paymentLabel}: $${data.paymentAmount.toFixed(2)}
              </p>
              ${data.totalAmount ? `
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #15803d;">
                Total Contract Amount: $${data.totalAmount.toFixed(2)}
              </p>
              ` : ""}
              ${data.remainingBalance !== undefined && data.remainingBalance > 0.01 ? `
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #15803d;">
                Remaining Balance: $${data.remainingBalance.toFixed(2)}
              </p>
              ` : ""}
            </div>
            ${data.receiptUrl ? `
            <div style="border-top: 1px solid #86efac; padding-top: 15px; margin-top: 15px;">
              <a href="${data.receiptUrl}" 
                 style="display: inline-block; background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                View Receipt
              </a>
            </div>
            ` : ""}
          </div>
          
          ${data.paymentType === "split_payment" && data.totalPayments ? `
          <div style="background: #f0f9ff; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Payment Progress:</strong> ${data.paymentNumber} of ${data.totalPayments} payments completed.
            </p>
          </div>
          ` : ""}
          
          ${data.paymentType === "incremental_payment" ? `
          <div style="background: #f0f9ff; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Incremental Payment:</strong> Payment ${data.paymentNumber || ""} has been processed successfully.
            </p>
          </div>
          ` : ""}
          
          ${data.remainingBalance !== undefined && data.remainingBalance > 0.01 ? `
          <div style="background: #fef3c7; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Remaining Balance:</strong> $${data.remainingBalance.toFixed(2)} is still due. ${isClient ? "You will receive a payment link when the remaining balance is due." : "The client will be notified when the remaining balance is due."}
            </p>
          </div>
          ` : ""}
          
          ${!data.remainingBalance || data.remainingBalance <= 0.01 ? `
          <div style="background: #f0fdf4; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #166534;">
              <strong>✅ Contract Fully Paid:</strong> All payments have been completed. The contract is now finalized.
            </p>
          </div>
          ` : ""}
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px;">
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              Thank you for your business!
            </p>
            ${isClient ? `
            <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">
              If you have any questions, please contact us at ${CONTACT_EMAIL}.
            </p>
            ` : ""}
          </div>
        </div>
      </body>
    </html>
  `;
  
  return { subject, html };
}
