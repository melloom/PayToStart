// Subscription email templates

export interface SubscriptionEmailData {
  contractorName: string;
  contractorEmail: string;
  companyName?: string;
  tier?: string;
  amount?: number;
  invoiceUrl?: string;
  billingPortalUrl?: string;
  trialEndDate?: Date;
  nextBillingDate?: Date;
}

export function getInvoicePaymentSucceededEmail(data: SubscriptionEmailData): { subject: string; html: string } {
  const subject = "Payment received for your subscription";
  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #16a34a; margin: 0; font-size: 28px;">✅ Payment Received</h1></div>
          <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.contractorName},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">Your subscription payment has been successfully processed.</p>
          <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 30px 0; border-radius: 4px;">
            ${data.tier ? `<p style="margin: 0 0 10px 0; font-size: 14px; color: #166534; font-weight: 600;">Plan: ${data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}</p>` : ""}
            ${data.amount ? `<p style="margin: 0; font-size: 18px; font-weight: 600; color: #166534;">Amount: $${(data.amount / 100).toFixed(2)}</p>` : ""}
            ${data.nextBillingDate ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #15803d;">Next billing date: ${data.nextBillingDate.toLocaleDateString()}</p>` : ""}
          </div>
          ${data.invoiceUrl ? `<div style="text-align: center; margin: 40px 0;"><a href="${data.invoiceUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View Invoice</a></div>` : ""}
          ${data.billingPortalUrl ? `<div style="text-align: center; margin: 20px 0;"><a href="${data.billingPortalUrl}" style="display: inline-block; color: #2563eb; text-decoration: underline; font-size: 14px;">Manage Subscription</a></div>` : ""}
          <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px;"><p style="font-size: 14px; color: #6b7280; margin: 0;">Thank you for your continued subscription!</p></div>
        </div>
      </body>
    </html>
  `;
  return { subject, html };
}

export function getInvoicePaymentFailedEmail(data: SubscriptionEmailData): { subject: string; html: string } {
  const subject = "Action required: Payment failed for your subscription";
  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #dc2626; margin: 0; font-size: 28px;">⚠️ Payment Failed</h1></div>
          <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.contractorName},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">We were unable to process your subscription payment. Please update your payment method to continue your subscription.</p>
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 30px 0; border-radius: 4px;">
            ${data.tier ? `<p style="margin: 0 0 10px 0; font-size: 14px; color: #991b1b; font-weight: 600;">Plan: ${data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}</p>` : ""}
            ${data.amount ? `<p style="margin: 0; font-size: 18px; font-weight: 600; color: #991b1b;">Amount: $${(data.amount / 100).toFixed(2)}</p>` : ""}
          </div>
          ${data.billingPortalUrl ? `<div style="text-align: center; margin: 40px 0;"><a href="${data.billingPortalUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Update Payment Method</a></div>` : ""}
          <div style="background: #fef3c7; border-radius: 6px; padding: 15px; margin: 20px 0;"><p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Important:</strong> Your subscription may be paused or cancelled if payment is not updated. Please update your payment method as soon as possible.</p></div>
          <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px;"><p style="font-size: 14px; color: #6b7280; margin: 0;">If you have any questions, please contact our support team.</p></div>
        </div>
      </body>
    </html>
  `;
  return { subject, html };
}

export function getTrialWillEndEmail(data: SubscriptionEmailData): { subject: string; html: string } {
  const subject = "Your trial ends soon";
  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #f59e0b; margin: 0; font-size: 28px;">⏰ Trial Ending Soon</h1></div>
          <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.contractorName},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">Your free trial will end in 3 days. To continue using Pay2Start, please ensure your payment method is up to date.</p>
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
            ${data.tier ? `<p style="margin: 0 0 10px 0; font-size: 14px; color: #92400e; font-weight: 600;">Plan: ${data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}</p>` : ""}
            ${data.trialEndDate ? `<p style="margin: 0; font-size: 18px; font-weight: 600; color: #92400e;">Trial ends: ${data.trialEndDate.toLocaleDateString()}</p>` : ""}
          </div>
          ${data.billingPortalUrl ? `<div style="text-align: center; margin: 40px 0;"><a href="${data.billingPortalUrl}" style="display: inline-block; background: #f59e0b; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Update Payment Method</a></div>` : ""}
          <div style="background: #f0f9ff; border-radius: 6px; padding: 15px; margin: 20px 0;"><p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>What happens next:</strong> After your trial ends, your subscription will automatically begin and you'll be charged for your selected plan.</p></div>
          <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px;"><p style="font-size: 14px; color: #6b7280; margin: 0;">Thank you for trying Pay2Start!</p></div>
        </div>
      </body>
    </html>
  `;
  return { subject, html };
}

export function getInvoiceUpcomingEmail(data: SubscriptionEmailData): { subject: string; html: string } {
  const subject = "Upcoming invoice for your subscription";
  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #2563eb; margin: 0; font-size: 28px;">📅 Upcoming Invoice</h1></div>
          <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.contractorName},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">This is a reminder that your subscription will be billed in 7 days.</p>
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0; border-radius: 4px;">
            ${data.tier ? `<p style="margin: 0 0 10px 0; font-size: 14px; color: #1e40af; font-weight: 600;">Plan: ${data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}</p>` : ""}
            ${data.amount ? `<p style="margin: 0; font-size: 18px; font-weight: 600; color: #1e40af;">Amount: $${(data.amount / 100).toFixed(2)}</p>` : ""}
            ${data.nextBillingDate ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #1e3a8a;">Billing date: ${data.nextBillingDate.toLocaleDateString()}</p>` : ""}
          </div>
          ${data.billingPortalUrl ? `<div style="text-align: center; margin: 40px 0;"><a href="${data.billingPortalUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Manage Subscription</a></div>` : ""}
          <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px;"><p style="font-size: 14px; color: #6b7280; margin: 0;">If you have any questions about your subscription, please contact our support team.</p></div>
        </div>
      </body>
    </html>
  `;
  return { subject, html };
}

