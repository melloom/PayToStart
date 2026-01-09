import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TemplatesListClient from "./templates-list-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Templates",
  description: "Manage your contract templates for faster contract creation",
};

export default async function TemplatesPage() {
  const contractor = await getCurrentContractor();

  if (!contractor) {
    redirect("/login");
  }

  const templates = await db.templates.findByContractorId(contractor.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Templates</h1>
          <p className="text-slate-600 text-lg">
            Create reusable contract templates for faster contract creation
          </p>
        </div>
        <Link href="/dashboard/templates/new" prefetch={true}>
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </Link>
      </div>

      <TemplatesListClient templates={templates} />
    </div>
  );
}

