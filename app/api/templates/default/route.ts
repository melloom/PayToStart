import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getCurrentContractor } from "@/lib/auth";
import { canPerformAction, incrementUsage } from "@/lib/subscriptions";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET - Fetch all default templates
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("default_contract_templates")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching default templates:", error);
      return NextResponse.json(
        { message: "Failed to fetch templates" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      templates: data || [],
    });
  } catch (error: any) {
    console.error("Error fetching default templates:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Import a default template to user's templates
export async function POST(request: Request) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await request.json();

    if (!templateId) {
      return NextResponse.json(
        { message: "Template ID is required" },
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

    // Fetch the default template
    const supabase = await createClient();
    const { data: defaultTemplate, error: fetchError } = await supabase
      .from("default_contract_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (fetchError || !defaultTemplate) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    // Create the template for the user
    const template = await db.templates.create({
      companyId: contractor.companyId,
      contractorId: contractor.id,
      name: defaultTemplate.name,
      content: defaultTemplate.content,
      fields: defaultTemplate.fields || [],
    });

    // Increment usage counter
    await incrementUsage(contractor.companyId, "templates").catch((error) => {
      console.error("Error incrementing usage counter:", error);
    });

    return NextResponse.json({
      success: true,
      template,
      message: "Template imported successfully",
    });
  } catch (error: any) {
    console.error("Error importing template:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}



