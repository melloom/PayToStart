import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import TemplatesListClient from "./templates-list-client";
import DefaultTemplatesSection from "./default-templates-section";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 flex items-center justify-center border-2 border-indigo-500/30 shadow-xl">
                  <FileText className="h-8 w-8 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-white mb-2">Templates</h1>
                  <p className="text-slate-300 text-lg">
                    Create reusable contract templates for faster contract creation
                  </p>
                </div>
              </div>
            </div>
            <Link href="/dashboard/templates/new" prefetch={true}>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl hover:shadow-indigo-500/30 transition-all font-semibold px-8 py-7 text-base group">
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
                New Template
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DefaultTemplatesSection />
        <TemplatesListClient templates={templates} />
      </div>
    </div>
  );
}
