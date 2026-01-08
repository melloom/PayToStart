import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getReminderEmail } from "@/lib/email/templates";

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

    if (contract.status !== "sent") {
      return NextResponse.json(
        { message: "Can only send reminders for contracts that are sent but not yet signed" },
        { status: 400 }
      );
    }

    const client = await db.clients.findById(contract.clientId);
    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sign/${contract.signingToken}`;

    // Generate reminder email using template
    const { subject, html } = getReminderEmail({
      contractTitle: contract.title,
      contractorName: contractor.name,
      contractorEmail: contractor.email,
      contractorCompany: contractor.companyName,
      clientName: client.name,
      clientEmail: client.email,
      signingUrl,
      depositAmount: contract.depositAmount,
      totalAmount: contract.totalAmount,
    });

    // Send email
    try {
      await sendEmail({
        to: client.email,
        subject,
        html,
      });
    } catch (emailError) {
      console.error("Error sending reminder email:", emailError);
      return NextResponse.json(
        { message: "Failed to send reminder email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reminder email sent successfully",
    });
  } catch (error: any) {
    console.error("Error sending reminder:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

