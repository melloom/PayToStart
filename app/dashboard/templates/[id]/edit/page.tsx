import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import EditTemplateForm from "./edit-template-form";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const contractor = await getCurrentContractor();
  if (!contractor) {
    return {
      title: "Edit Template",
      description: "Edit contract template",
    };
  }

  const template = await db.templates.findById(params.id);
  if (!template || template.contractorId !== contractor.id) {
    return {
      title: "Template Not Found",
      description: "Template not found",
    };
  }

  return {
    title: `Edit Template: ${template.name}`,
    description: `Edit contract template: ${template.name}`,
  };
}

export default async function EditTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  const contractor = await getCurrentContractor();

  if (!contractor) {
    redirect("/login");
  }

  const template = await db.templates.findById(params.id);

  if (!template || template.contractorId !== contractor.id) {
    redirect("/dashboard/templates");
  }

  return <EditTemplateForm template={template} />;
}



