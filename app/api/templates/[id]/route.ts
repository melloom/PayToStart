import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const template = await db.templates.findById(params.id);
    if (!template || template.contractorId !== contractor.id) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const template = await db.templates.findById(params.id);
    if (!template || template.contractorId !== contractor.id) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 });
    }

    const data = await request.json();
    const { name, content, fields } = data;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (content !== undefined) updateData.content = content;
    if (fields !== undefined) updateData.fields = fields;

    const updatedTemplate = await db.templates.update(params.id, updateData);

    return NextResponse.json({
      success: true,
      template: updatedTemplate,
    });
  } catch (error: any) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const template = await db.templates.findById(params.id);
    if (!template || template.contractorId !== contractor.id) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 });
    }

    await db.templates.delete(params.id);

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

