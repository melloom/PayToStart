// Subscription email templates

import type { SubscriptionTier } from "@/lib/types";
import { TIER_CONFIG } from "@/lib/types";

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
  hasTrial?: boolean;
  trialDaysRemaining?: number;
}

export interface SubscriptionCreatedEmailData {
  contractorName: string;
  contractorEmail: string;
  tier: SubscriptionTier;
  hasTrial: boolean;
  trialEndDate?: Date;
  subscriptionStartDate: Date;
  nextBillingDate?: Date;
  dashboardUrl?: string;
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

/**
 * Subscription Created Email - Beautiful welcome email when user subscribes
 * Subject: "Welcome to [Tier] Plan! 🎉"
 */
export function getSubscriptionCreatedEmail(data: SubscriptionCreatedEmailData): { subject: string; html: string } {
  const tierConfig = TIER_CONFIG[data.tier];
  const tierName = tierConfig.name;
  const tierPrice = tierConfig.price;
  
  // Get tier-specific features
  const getTierFeatures = (tier: SubscriptionTier): string[] => {
    const baseFeatures: Record<SubscriptionTier, string[]> = {
      free: [
        "3 Contracts only (lifetime)",
        "No templates",
        "Basic features",
      ],
      starter: [
        "2 Contract Templates",
        "20 Contracts per month",
        "AI Contract Generation",
        "Click to Sign",
        "Email Delivery",
        "Basic Support",
      ],
      pro: [
        "Unlimited Templates",
        "Unlimited Contracts",
        "AI Contract Generation",
        "Click to Sign",
        "Email Delivery",
        "SMS Reminders",
        "File Attachments",
        "Custom Branding",
        "Download All Contracts",
        "Priority Support",
      ],
      premium: [
        "Everything in Pro, plus:",
        "Dropbox Sign Integration",
        "DocuSign Integration",
        "Multi-user Team Roles",
        "Stripe Connect Payouts",
        "Dedicated Support",
        "Custom Integrations",
      ],
    };
    return baseFeatures[tier] || [];
  };

  const features = getTierFeatures(data.tier);
  const trialEndDateFormatted = data.trialEndDate 
    ? data.trialEndDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : null;
  const nextBillingDateFormatted = data.nextBillingDate
    ? data.nextBillingDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : null;

  const subject = `Welcome to ${tierName} Plan! 🎉`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
                <!-- Header with Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); padding: 50px 40px; text-align: center;">
                    <div style="margin-bottom: 20px;">
                      <div style="width: 80px; height: 80px; margin: 0 auto; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                        <span style="font-size: 48px;">🎉</span>
                      </div>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                      Welcome to ${tierName}!
                    </h1>
                    <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px; font-weight: 500;">
                      Your subscription is now active
                    </p>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0; font-weight: 500;">
                      Hello ${data.contractorName},
                    </p>
                    <p style="font-size: 16px; color: #4b5563; margin: 0 0 30px 0; line-height: 1.7;">
                      Thank you for subscribing to Pay2Start! We're thrilled to have you on board. Your <strong style="color: #6366f1;">${tierName} Plan</strong> is now active and ready to use.
                    </p>

                    ${data.hasTrial && data.trialEndDate ? `
                    <!-- Trial Information -->
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 5px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 30px 0; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1);">
                      <div style="display: flex; align-items: center; margin-bottom: 15px;">
                        <div style="width: 40px; height: 40px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                          <span style="font-size: 24px;">⏰</span>
                        </div>
                        <div>
                          <h3 style="color: #92400e; margin: 0; font-size: 20px; font-weight: 700;">
                            7-Day Free Trial Active
                          </h3>
                          <p style="color: #78350f; margin: 5px 0 0 0; font-size: 14px;">
                            Enjoy full access for 7 days, no charge!
                          </p>
                        </div>
                      </div>
                      <div style="background: rgba(255,255,255,0.6); border-radius: 8px; padding: 15px; margin-top: 15px;">
                        <p style="margin: 0; color: #78350f; font-size: 15px; font-weight: 600;">
                          <span style="display: block; margin-bottom: 5px;">📅 Trial Ends: <strong style="color: #92400e;">${trialEndDateFormatted}</strong></span>
                          ${nextBillingDateFormatted ? `<span style="display: block; margin-top: 5px;">💳 First Charge: <strong style="color: #92400e;">${nextBillingDateFormatted}</strong></span>` : ""}
                        </p>
                      </div>
                    </div>
                    ` : ""}

                    <!-- Subscription Details -->
                    <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 30px; margin: 30px 0; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);">
                      <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">
                        <span style="margin-right: 10px;">📋</span>
                        Subscription Details
                      </h3>
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                          <p style="margin: 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 5px;">
                            Plan
                          </p>
                          <p style="margin: 0; color: #1e40af; font-size: 20px; font-weight: 700;">
                            ${tierName}
                          </p>
                        </div>
                        <div>
                          <p style="margin: 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 5px;">
                            Price
                          </p>
                          <p style="margin: 0; color: #1e40af; font-size: 20px; font-weight: 700;">
                            $${tierPrice}<span style="font-size: 14px; color: #64748b;">/month</span>
                          </p>
                        </div>
                      </div>
                      ${!data.hasTrial && nextBillingDateFormatted ? `
                      <div style="border-top: 2px solid rgba(59, 130, 246, 0.2); padding-top: 15px; margin-top: 15px;">
                        <p style="margin: 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 5px;">
                          Next Billing Date
                        </p>
                        <p style="margin: 0; color: #1e40af; font-size: 18px; font-weight: 600;">
                          ${nextBillingDateFormatted}
                        </p>
                      </div>
                      ` : ""}
                    </div>

                    <!-- Features List -->
                    <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin: 30px 0; border: 2px solid #e5e7eb;">
                      <h3 style="color: #111827; margin: 0 0 20px 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">
                        <span style="margin-right: 10px;">✨</span>
                        What You Get
                      </h3>
                      <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
                        ${features.map((feature, index) => {
                          const isUpgradeHeader = feature.startsWith("Everything in");
                          return `
                            <div style="display: flex; align-items: flex-start; padding: 12px; background: ${isUpgradeHeader ? "transparent" : "#ffffff"}; border-radius: 8px; ${!isUpgradeHeader ? "box-shadow: 0 1px 3px rgba(0,0,0,0.05);" : ""}">
                              ${!isUpgradeHeader ? `
                                <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; margin-top: 2px;">
                                  <span style="color: #ffffff; font-size: 14px; font-weight: 700;">✓</span>
                                </div>
                              ` : `
                                <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; margin-top: 2px;">
                                  <span style="color: #ffffff; font-size: 14px; font-weight: 700;">+</span>
                                </div>
                              `}
                              <p style="margin: 0; color: ${isUpgradeHeader ? "#6366f1" : "#374151"}; font-size: 15px; font-weight: ${isUpgradeHeader ? "700" : "500"}; font-style: ${isUpgradeHeader ? "italic" : "normal"}; line-height: 1.5;">
                                ${feature}
                              </p>
                            </div>
                          `;
                        }).join("")}
                      </div>
                    </div>

                    <!-- CTA Button -->
                    ${data.dashboardUrl ? `
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="${data.dashboardUrl}" 
                         style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); transition: transform 0.2s;">
                        Get Started Now →
                      </a>
                    </div>
                    ` : ""}

                    <!-- Help Section -->
                    <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 30px 0;">
                      <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.6;">
                        <strong style="color: #0369a1;">💡 Need Help?</strong><br>
                        Our support team is here to help you get the most out of your subscription. If you have any questions, just reply to this email or visit our help center.
                      </p>
                    </div>

                    <!-- Footer -->
                    <div style="border-top: 2px solid #e5e7eb; margin-top: 40px; padding-top: 30px; text-align: center;">
                      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                        Thank you for choosing Pay2Start!
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        This email was sent to ${data.contractorEmail}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Subscription Ending Email - Sent day before subscription ends
 * Subject: "Your subscription ends tomorrow"
 */
export function getSubscriptionEndingEmail(data: SubscriptionEmailData & { subscriptionEndDate: Date }): { subject: string; html: string } {
  const subject = "Your subscription ends tomorrow";
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
                <!-- Header with Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 50px 40px; text-align: center;">
                    <div style="margin-bottom: 20px;">
                      <div style="width: 80px; height: 80px; margin: 0 auto; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                        <span style="font-size: 48px;">⏰</span>
                      </div>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                      Subscription Ending Tomorrow
                    </h1>
                    <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px; font-weight: 500;">
                      Your access will change soon
                    </p>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0; font-weight: 500;">
                      Hello ${data.contractorName},
                    </p>
                    <p style="font-size: 16px; color: #4b5563; margin: 0 0 30px 0; line-height: 1.7;">
                      This is a friendly reminder that your <strong style="color: #f59e0b;">${data.tier ? data.tier.charAt(0).toUpperCase() + data.tier.slice(1) : "subscription"}</strong> will end tomorrow, <strong style="color: #d97706;">${data.subscriptionEndDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong>.
                    </p>

                    <!-- Warning Box -->
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 5px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 30px 0; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1);">
                      <div style="display: flex; align-items: center; margin-bottom: 15px;">
                        <div style="width: 40px; height: 40px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                          <span style="font-size: 24px;">⚠️</span>
                        </div>
                        <div>
                          <h3 style="color: #92400e; margin: 0; font-size: 20px; font-weight: 700;">
                            What Happens Next
                          </h3>
                        </div>
                      </div>
                      <div style="background: rgba(255,255,255,0.6); border-radius: 8px; padding: 15px; margin-top: 15px;">
                        <p style="margin: 0 0 10px 0; color: #78350f; font-size: 15px; font-weight: 600;">
                          After your subscription ends, you will:
                        </p>
                        <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                          <li>Lose access to premium features</li>
                          <li>Be downgraded to the Free plan</li>
                          <li>Have limited contract and template creation</li>
                          <li>Keep access to your existing contracts</li>
                        </ul>
                      </div>
                    </div>

                    <!-- CTA Button -->
                    ${data.billingPortalUrl ? `
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="${data.billingPortalUrl}" 
                         style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4);">
                        Renew Your Subscription →
                      </a>
                    </div>
                    ` : ""}

                    <!-- Help Section -->
                    <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 30px 0;">
                      <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.6;">
                        <strong style="color: #0369a1;">💡 Questions?</strong><br>
                        If you have any questions about your subscription or need assistance, please contact our support team. We're here to help!
                      </p>
                    </div>

                    <!-- Footer -->
                    <div style="border-top: 2px solid #e5e7eb; margin-top: 40px; padding-top: 30px; text-align: center;">
                      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                        Thank you for being a Pay2Start subscriber!
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        This email was sent to ${data.contractorEmail}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
  return { subject, html };
}


