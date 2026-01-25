// Notification preference checking for email sending
import { db } from "../db";
import { createClient } from "../supabase-server";

export type NotificationType =
  | "contractSigned"
  | "contractPaid"
  | "contractSent"
  | "paymentReceived"
  | "invoiceUpcoming"
  | "subscriptionUpdates"
  | "marketingEmails";

interface NotificationPreferences {
  contractSigned?: boolean;
  contractPaid?: boolean;
  contractSent?: boolean;
  paymentReceived?: boolean;
  invoiceUpcoming?: boolean;
  subscriptionUpdates?: boolean;
  marketingEmails?: boolean;
}

/**
 * Check if a contractor should receive a notification based on their preferences
 * @param contractorId - The contractor's ID
 * @param notificationType - The type of notification
 * @returns true if the contractor should receive the notification, false otherwise
 */
export async function shouldSendNotification(
  contractorId: string,
  notificationType: NotificationType
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contractors")
      .select("notification_preferences")
      .eq("id", contractorId)
      .single();

    if (error || !data) {
      // If we can't get preferences, default to sending (backward compatibility)
      console.warn(`Could not fetch notification preferences for contractor ${contractorId}, defaulting to send`);
      return true;
    }

    const preferences: NotificationPreferences = data.notification_preferences || {
      contractSigned: true,
      contractPaid: true,
      contractSent: true,
      paymentReceived: true,
      invoiceUpcoming: true,
      subscriptionUpdates: true,
      marketingEmails: false,
    };

    // Check the specific preference, defaulting to true if not set
    const shouldSend = preferences[notificationType] !== false;
    
    if (!shouldSend) {
      console.log(`Notification ${notificationType} skipped for contractor ${contractorId} due to preferences`);
    }

    return shouldSend;
  } catch (error) {
    console.error(`Error checking notification preferences for contractor ${contractorId}:`, error);
    // Default to sending on error (backward compatibility)
    return true;
  }
}

/**
 * Send email only if the contractor has enabled this notification type
 * @param contractorId - The contractor's ID
 * @param notificationType - The type of notification
 * @param sendEmailFn - Function that sends the email (only called if preferences allow)
 * @returns Result of sendEmailFn if sent, or { skipped: true } if skipped
 */
export async function sendNotificationIfEnabled(
  contractorId: string,
  notificationType: NotificationType,
  sendEmailFn: () => Promise<any>
): Promise<any> {
  const shouldSend = await shouldSendNotification(contractorId, notificationType);
  
  if (!shouldSend) {
    return { skipped: true, reason: "notification_preference_disabled" };
  }

  return await sendEmailFn();
}

