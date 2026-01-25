import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { log } from "@/lib/logger";
import { sanitizePhoneNumber } from "@/lib/security/validation";

// For production, you would use a service like Twilio, AWS SNS, or similar
// This is a placeholder that logs the SMS for now
async function sendSMS(phoneNumber: string, message: string) {
  // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
  // Example with Twilio:
  // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   body: message,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: phoneNumber
  // });
  
  log.info({ phoneNumber, messageLength: message.length }, "SMS would be sent");
  return { success: true };
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const contract = await db.contracts.findById(params.id);
    if (!contract || contract.contractorId !== contractor.id) {
      return NextResponse.json({ message: "Contract not found" }, { status: 404 });
    }

    if (contract.status === "cancelled" || contract.status === "completed") {
      return NextResponse.json(
        { message: "Cannot send SMS for cancelled or completed contracts" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { phoneNumber, signingUrl } = body;

    if (!phoneNumber || !signingUrl) {
      return NextResponse.json(
        { message: "Phone number and signing URL are required" },
        { status: 400 }
      );
    }

    // Sanitize and validate phone number
    const sanitizedPhone = sanitizePhoneNumber(phoneNumber);
    if (!sanitizedPhone) {
      return NextResponse.json(
        { message: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const client = await db.clients.findById(contract.clientId);
    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    // Create SMS message
    const message = `Hello ${client.name || "there"},

You have a contract to sign from ${contractor.name}${contractor.companyName ? ` (${contractor.companyName})` : ""}.

Contract: ${contract.title}

Please sign here: ${signingUrl}

This link is secure and will expire.`;

    // Send SMS
    try {
      await sendSMS(sanitizedPhone, message);
      
      log.info({
        event: "contract_sms_sent",
        contractId: contract.id,
        contractorId: contractor.id,
        phoneNumber: sanitizedPhone,
      }, "Contract SMS sent successfully");

      return NextResponse.json({
        success: true,
        message: "SMS sent successfully",
      });
    } catch (smsError) {
      log.error({ error: smsError }, "Error sending SMS");
      return NextResponse.json(
        { message: "Failed to send SMS. Please try again later." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    log.error({ error }, "Error in send-sms route");
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
