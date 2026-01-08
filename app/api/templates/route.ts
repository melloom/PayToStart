import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ContractTemplate } from "@/lib/types";
import { canPerformAction, incrementUsage } from "@/lib/subscriptions";

export async function GET() {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const templates = await db.templates.findByContractorId(contractor.id);
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { name, content, fields } = data;

    if (!name || !content) {
      return NextResponse.json(
        { message: "Name and content are required" },
        { status: 400 }
      );
    }

    // Check tier limit for templates
    const canCreateTemplate = await canPerformAction(
      contractor.companyId,
      "templates",
      1
    );

    if (!canCreateTemplate.allowed) {
      return NextResponse.json(
        {
          error: "Tier limit exceeded",
          message: canCreateTemplate.reason || "Template creation limit reached",
          currentCount: canCreateTemplate.currentCount,
          limit: canCreateTemplate.limit,
        },
        { status: 403 }
      );
    }

    const template = await db.templates.create({
      companyId: contractor.companyId,
      contractorId: contractor.id,
      name,
      content,
      fields: fields || [],
    });

    // Increment usage counter for templates
    await incrementUsage(contractor.companyId, "templates").catch((error) => {
      console.error("Error incrementing usage counter:", error);
      // Don't fail the request if usage counter fails
    });

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error: any) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

