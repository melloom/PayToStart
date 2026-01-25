"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus, FileText, Edit, Trash2, Search, X, Sparkles, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { ContractTemplate } from "@/lib/types";
import { Input } from "@/components/ui/input";

export default function TemplatesListClient({ templates }: { templates: ContractTemplate[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Template deleted",
          description: "Template has been deleted successfully.",
        });
        router.refresh();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to delete template",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTemplates = templates.filter((template) =>
    searchQuery.trim()
      ? template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  if (templates.length === 0) {
    return (
      <div className="border-2 border-slate-700/50 shadow-xl bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="p-16">
          <div className="text-center max-w-lg mx-auto">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600/30 via-indigo-600/30 to-purple-600/30 flex items-center justify-center mx-auto shadow-2xl">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 blur-xl"></div>
                <FileText className="h-12 w-12 text-indigo-300 relative z-10" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">No Templates Yet</h3>
            <p className="text-slate-300 text-lg mb-2 leading-relaxed">
              Create reusable contract templates to speed up your contract creation process.
            </p>
            <p className="text-slate-400 text-sm mb-6">
              Templates allow you to save time by reusing contract structures with customizable fields.
            </p>
            <Link href="/dashboard/templates/new">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all font-semibold px-8 py-6 text-base">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Template
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="border-2 border-slate-700/50 shadow-xl bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center border border-indigo-500/20">
                <Sparkles className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">All Templates</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {filteredTemplates.length} {filteredTemplates.length === 1 ? "template" : "templates"}
                </p>
              </div>
            </div>
            <div className="relative w-full sm:w-auto sm:min-w-[350px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 bg-slate-700/30 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="border-2 border-slate-700/50 shadow-xl bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden">
          <div className="p-12 text-center">
            <p className="text-slate-300">No templates match your search.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="border-2 border-slate-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm hover:border-indigo-500/80 hover:shadow-xl hover:shadow-indigo-500/10 transition-all rounded-xl overflow-hidden flex flex-col group"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <FileText className="h-4 w-4" />
                      <span>{template.fields.length} field{template.fields.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center border border-indigo-500/20 flex-shrink-0">
                    <FileText className="h-5 w-5 text-indigo-400" />
                  </div>
                </div>

                <div className="flex-1 mb-4">
                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    {template.content.substring(0, 150)}
                    {template.content.length > 150 ? "..." : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 pt-4 border-t border-slate-700">
                  <Calendar className="h-3 w-3" />
                  <span>Updated {format(template.updatedAt, "MMM d, yyyy")}</span>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Link href={`/dashboard/templates/${template.id}/edit`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-indigo-500"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleDelete(template.id)}
                    variant="outline"
                    className="flex-1 border-slate-600 text-red-400 hover:bg-red-900/20 hover:border-red-700 hover:text-red-300"
                    disabled={deletingId === template.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deletingId === template.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
