import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import EditTemplateForm from "./edit-template-form";

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

